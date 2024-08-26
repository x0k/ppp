<script lang="ts" module>
  import type { Component, Snippet } from "svelte";
  
  import type { Lang } from '@/i18n';
  import { type Language } from "@/shared/languages";
  
  export interface Runtime<I, O> {
    initialValue: string;
    testCompilerFactory: TestCompilerFactory<I, O>;
    Description: Component;
  }
  
  export interface Props<L extends Language, I, O> {
    pageLang: Lang;
    contentId: string;
    testCases: TestCase<I, O>[];
    runtimes: Record<L, Runtime<I, O>>;
    children?: Snippet;
  }
</script>

<script lang="ts" generics="Langs extends Language, Input, Output">
  import { editor } from 'monaco-editor';
  import { stringifyError } from 'libs/error';
  import { createLogger } from 'libs/logger';
  import { type Context, createContext } from 'libs/context';
  import { runTests, type TestCase, type TestCompiler, type TestCompilerFactory } from "testing";
  
  import { debouncedSave, immediateSave } from '@/lib/sync-storage.svelte';
  import { reactiveWindow } from '@/lib/reactive-window.svelte';
  import { LANGUAGE_TITLE } from '@/shared/languages'
  import { MONACO_LANGUAGE_ID } from '@/adapters/monaco';
  import { createSyncStorage } from '@/adapters/storage';
  import ResizablePanel, { Alignment } from '@/components/resizable-panel.svelte';
  import Editor from '@/components/editor2/editor.svelte';
  import Panel from '@/components/editor2/panel/panel.svelte';
  import { createTerminal, createTerminalWriter, EditorContext, setEditorContext } from '@/components/editor2';
  
  const { pageLang, contentId, testCases, runtimes, children }: Props<Langs, Input, Output> = $props();

  const languages = Object.keys(runtimes) as Langs[];
  if (languages.length === 0) {
    throw new Error("No test runner factories provided");
  }
  const defaultLang = languages[0];
  const langStorage = createSyncStorage(
    localStorage,
    "test-editor-lang",
    defaultLang
  )
  const initialLang = langStorage.load();
  let lang = $state(initialLang in runtimes ? initialLang : defaultLang);
  let runtime = $derived(runtimes[lang]);
  let contentStorage = $derived(
    createSyncStorage(
      sessionStorage,
      `test-editor-content-${contentId}-${lang}`,
      runtime.initialValue
    )
  );

  const model = editor.createModel("")
  $effect(() => {
    model.setValue(contentStorage.load())
    editor.setModelLanguage(model, MONACO_LANGUAGE_ID[lang])

    let saveCallbackId: NodeJS.Timeout;
    const disposable = model.onDidChangeContent(() => {
      clearTimeout(saveCallbackId);
      saveCallbackId = setTimeout(() => {
        contentStorage.save(model.getValue());
      }, 1000);
      return () => {
        clearTimeout(saveCallbackId);
      };
    });

    return () => {
      clearTimeout(saveCallbackId);
      disposable.dispose();
    };
  })

  const { terminal, fitAddon } = createTerminal();

  setEditorContext(new EditorContext(
    pageLang,
    model,
    terminal,
    fitAddon,
  ))

  let barWidth = $state(Math.round(reactiveWindow.innerWidth / 3))

  const panelHeightStorage = createSyncStorage(
    localStorage,
    "test-editor-panel-height",
    Math.round(reactiveWindow.innerHeight / 3)
  )
  let panelHeight = $state(panelHeightStorage.load())
  debouncedSave(panelHeightStorage, () => panelHeight, 300)

  const vimStateStorage = createSyncStorage(
    localStorage,
    "test-editor-vim-state",
    false
  )
  let vimState = $state(vimStateStorage.load())
  immediateSave(vimStateStorage, () => vimState)

  const executionTimeoutStorage = createSyncStorage(
    localStorage,
    "test-editor-execution-timeout",
    60000
  )
  let executionTimeout = $state(executionTimeoutStorage.load())
  debouncedSave(executionTimeoutStorage, () => executionTimeout, 100)

  const terminalWriter = createTerminalWriter(terminal)
  const terminalLogger = createLogger(terminalWriter)
  let testCompilerFactory = $derived(runtime.testCompilerFactory)
  let isRunning = $state(false)
  let lastTestId = $state(-1)
  let ctx: Context | null = null
  let testCompiler: TestCompiler<Input, Output> | null = null
  $effect(() => {
    testCompilerFactory;
    isRunning = false;
    testCompiler = null;
    return () => {
      if (testCompiler === null) {
        return
      }
      testCompiler[Symbol.dispose]();
      testCompiler = null;
    }
  })

  async function handleRun() {
    if (isRunning) {
      ctx?.cancel();
      return;
    }
    ctx = createContext(executionTimeout)
    isRunning = true;
    terminal.clear()
    try {
      if (testCompiler === null) {
        testCompiler = await testCompilerFactory(ctx, terminalWriter);
      }
      const testProgram = await testCompiler.compile(ctx, [{
        filename: "main",
        content: model.getValue(),
      }])
      try {
        lastTestId = await runTests(ctx, terminalLogger, testProgram, testCases);
      } finally {
        testProgram[Symbol.dispose]();
      }
    } catch (err) {
      console.error(err);
      terminalLogger.error(stringifyError(err));
    } finally {
      isRunning = false;
      ctx = null;
    }
  }

  let descriptionDialogElement: HTMLDialogElement
  let describedLanguage = $state(defaultLang)
  let Description = $derived(runtimes[describedLanguage].Description)
</script>

<div class="h-screen flex">
  <ResizablePanel class="relative" alignment={Alignment.End} bind:size={barWidth}>
    {#if children}
      {@render children()}
    {:else}
      Bar content
    {/if}
  </ResizablePanel>
  <div class="grow min-w-0 flex flex-col">
    <Editor width={reactiveWindow.innerWidth - barWidth} height={reactiveWindow.innerHeight - panelHeight} />
    <Panel bind:height={panelHeight} maxHeight={reactiveWindow.innerHeight}>
      Panel
    </Panel>
  </div>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog bind:this={descriptionDialogElement} class="modal" onclick={(e) => e.stopPropagation()}>
  <div class="modal-box max-w-2xl w-full">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 class="text-lg font-bold">{LANGUAGE_TITLE[describedLanguage]}</h3>
    <div class="flex flex-col items-start gap-2 py-4">
      <Description />
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
