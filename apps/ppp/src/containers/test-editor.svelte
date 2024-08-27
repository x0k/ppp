<script lang="ts" module>
  import { type Snippet } from "svelte";
  
  import { type Language } from "@/shared/languages";
  import { type Lang } from '@/i18n';
  
  export interface Runtime<I, O> {
    initialValue: string;
    testCompilerFactory: TestCompilerFactory<I, O>;
  }
  
  export interface Props<L extends Language, I, O> {
    pageLang: Lang;
    contentId: string;
    testCases: TestCase<I, O>[];
    runtimes: Record<L, Runtime<I, O>>;
    children: Snippet;
  }
</script>

<script lang="ts" generics="Langs extends Language, Input, Output">
  import { untrack } from 'svelte'
  import Icon from '@iconify/svelte';
  import { editor } from 'monaco-editor';
  import { stringifyError } from 'libs/error';
  import { createLogger } from 'libs/logger';
  import { type Context, createContext } from 'libs/context';
  import { runTests, type TestCase, type TestCompiler, type TestCompilerFactory } from "testing";
  
  import { debouncedSave, immediateSave } from '@/lib/sync-storage.svelte';
  import { reactiveWindow } from '@/lib/reactive-window.svelte';
  import { ProblemCategory } from '@/shared/problems';
  import { LANGUAGE_TITLE, LANGUAGE_ICONS } from '@/shared/languages'
  import { EditorPanelTab } from '@/shared/editor-panel-tab';
  import { getProblemCategoryLabel, useTranslations, Label } from '@/i18n';
  import { MONACO_LANGUAGE_ID } from '@/adapters/monaco';
  import { createSyncStorage } from '@/adapters/storage';
  import { DESCRIPTIONS } from '@/adapters/runtime/test-descriptions'
  import Dropdown from '@/components/dropdown.svelte';
  import ResizablePanel from '@/components/resizable-panel.svelte';
  import { Editor, VimStatus, RunButton, createTerminal, createTerminalWriter, EditorContext, setEditorContext } from '@/components/editor';
  import { Panel, Tab, Tabs, TerminalTab, TabContent } from "@/components/editor/panel";
  import { CheckBox, Number } from '@/components/editor/controls';

  const { pageLang, contentId, testCases, runtimes, children }: Props<Langs, Input, Output> = $props();
  const t = useTranslations(pageLang);

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
  immediateSave(langStorage, () => lang);
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

  const editorWidthStorage = createSyncStorage(
    localStorage,
    "test-editor-width",
    Math.round(reactiveWindow.innerWidth / 3 * 2)
  )
  let editorWidth = $state(editorWidthStorage.load())
  debouncedSave(editorWidthStorage, () => editorWidth, 300)
  const EDITOR_MIN_WIDTH = 5
  function normalizeWidth(width: number, oldWidth: number) {
    const windowWidth = reactiveWindow.innerWidth
    const newEditorWidth = Math.max(EDITOR_MIN_WIDTH, Math.min(windowWidth, width))
    const diff = windowWidth - newEditorWidth
    if (diff < 300) {
      return windowWidth
    }
    if (diff < 500) {
      return oldWidth
    }
    return newEditorWidth
  }
  let lastWindowWidth = reactiveWindow.innerWidth;
  $effect(() => {
    const newWidth = reactiveWindow.innerWidth
    untrack(() => {
      editorWidth = normalizeWidth(editorWidth + newWidth - lastWindowWidth, editorWidth)
    })
    lastWindowWidth = newWidth
  })

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
  let Description = $derived(DESCRIPTIONS[describedLanguage])
</script>

<div class="h-screen flex">
  <div class="h-full overflow-auto" style="width: {reactiveWindow.innerWidth - editorWidth}px">
    <div class="p-6">
      <div class="flex gap-3 items-center mb-8">
        <div>
          3P
        </div>
        <div class="breadcrumbs">
          <ul>
            <li><a>{t(getProblemCategoryLabel(ProblemCategory.DesignPatterns))}</a></li>
          </ul>
        </div>
        <div class="join ml-auto rounded">
          <button class="btn btn-ghost join-item"
            ><Icon icon="lucide:chevron-left" /></button
          >
          <button class="btn btn-ghost join-item"
            ><Icon icon="lucide:chevron-right" /></button
          >
          <button class="btn btn-ghost join-item"
            ><Icon icon="lucide:shuffle" /></button
          >
          <button class="btn btn-ghost join-item"
            ><Icon icon="lucide:rotate-ccw" /></button
          >
        </div>
      </div>
      <div class="prose prose-lg max-w-none">
        {@render children()}
      </div>
    </div>
  </div>
  <ResizablePanel normalizeSize={normalizeWidth} class="relative grow min-w-0 flex flex-col" bind:size={editorWidth}>
    <Editor width={editorWidth} height={reactiveWindow.innerHeight - panelHeight} />
    <Panel bind:height={panelHeight} maxHeight={reactiveWindow.innerHeight}>
      <div class="flex flex-wrap items-center gap-3 p-1">
        <RunButton {isRunning} onClick={handleRun} />
        <Tabs>
          <Tab tab={EditorPanelTab.Output} />
          <Tab tab={EditorPanelTab.Tests}>
            {#snippet append()}
              <div
                class="badge"
                class:hidden={lastTestId < 0}
                class:badge-success={lastTestId === testCases.length}
                class:badge-error={lastTestId < testCases.length && lastTestId >= 0}
              >
                {lastTestId}/{testCases.length}
              </div>
            {/snippet}
          </Tab>
          <Tab tab={EditorPanelTab.Settings} />
        </Tabs>
        <div class="grow"></div>
        <VimStatus bind:vimState />
        <Dropdown
          bind:value={lang}
          options={languages}
        >
          {#snippet preLabel(lang)}
            <Icon icon={LANGUAGE_ICONS[lang]} />
          {/snippet}
          {#snippet label(lang)}
            {LANGUAGE_TITLE[lang]}
          {/snippet}
          {#snippet postLabel(lang)}
            <Icon onclick={(e) => {
              describedLanguage = lang
              e.stopPropagation()
              descriptionDialogElement.showModal()
            }} class="invisible group-hover:visible" icon="lucide:info" />
          {/snippet}
        </Dropdown>
      </div>
      <div class="grow flex flex-col overflow-hidden" >
        <TerminalTab width={reactiveWindow.innerWidth} height={panelHeight} class="grow ml-4 mt-4" />
        <TabContent tab={EditorPanelTab.Tests}>
          <div class="overflow-auto flex flex-col gap-4 p-4" >
            {#each testCases as testCase, i}
              <div>
                <div class="flex items-center gap-2 pb-2">
                  {#if lastTestId === i}
                    <Icon icon="lucide:circle-x" class="text-error" />
                  {:else if i < lastTestId}
                    <Icon icon="lucide:circle-check" class="text-success" />
                  {:else}
                    <Icon icon="lucide:circle-dashed" />
                  {/if}
                  Case {i + 1}
                </div>
                <pre class="p-2 rounded bg-base-100"><code
                    >{JSON.stringify(testCase.input, null, 2)}</code
                  ></pre>
              </div>
            {/each}
          </div>
        </TabContent>
        <TabContent tab={EditorPanelTab.Settings}>
          <div class="overflow-auto flex flex-col gap-4 p-4">
            <CheckBox title={Label.EditorSettingsVimMode} bind:value={vimState} />
            <Number title={Label.EditorSettingsExecutionTimeout} alt={Label.EditorSettingsExecutionTimeoutAlt} bind:value={executionTimeout} />
          </div>
        </TabContent>
      </div>
    </Panel>
  </ResizablePanel>
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
