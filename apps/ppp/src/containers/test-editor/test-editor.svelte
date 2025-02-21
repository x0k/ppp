<script lang="ts" generics="Langs extends Language, Input, Output">
  import { untrack } from "svelte";
  import Icon from "@iconify/svelte";
  import { editor } from "monaco-editor";
  import { stringifyError } from "libs/error";
  import { createLogger } from "libs/logger";
  import {
    createContext,
    createRecoverableContext,
    withCancel,
    withTimeout,
  } from "libs/context";
  import { runTests, type TestCompiler } from "libs/testing";

  import { debouncedSave, immediateSave } from "@/lib/sync-storage.svelte";
  import { reactiveWindow } from "@/lib/reactive-window.svelte";
  import { problemCategoryPage } from "@/shared/problems";
  import { LANGUAGE_TITLE, LANGUAGE_ICONS, Language } from "@/shared/languages";
  import { EditorPanelTab } from "@/shared/editor-panel-tab";
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";
  import { createSyncStorage } from "@/adapters/storage";
  import { DESCRIPTIONS } from "@/adapters/runtime/test-descriptions";
  import Logo from "@/components/logo.svelte";
  import Dropdown from "@/components/dropdown.svelte";
  import ResizablePanel from "@/components/resizable-panel.svelte";
  import {
    Editor,
    VimStatus,
    RunButton,
    createTerminal,
    EditorContext,
    setEditorContext,
    type ProcessStatus,
    createStreams,
  } from "@/components/editor";
  import {
    Panel,
    PanelToggle,
    Tab,
    Tabs,
    TerminalTab,
    TabContent,
  } from "@/components/editor/panel";
  import { CheckBox, Number } from "@/components/editor/controls";
  import { PROBLEM_CATEGORY_TO_LABEL } from "@/i18n";
  import { localizeHref } from '@/paraglide/runtime'
  import * as m from "@/paraglide/messages";

  import {
    DESCRIPTION_PANEL_FLIP_POINT,
    DESCRIPTION_PANEL_MIN_WIDTH,
    EDITOR_MIN_WIDTH,
    type Props,
  } from "./model";

  const {
    problemCategory,
    contentId,
    testCases,
    runtimes,
    children,
  }: Props<Langs, Input, Output> = $props();

  const languages = Object.keys(runtimes).sort() as Langs[];
  if (languages.length === 0) {
    throw new Error("No test runner factories provided");
  }
  const defaultLang = languages[0];
  const langStorage = createSyncStorage(
    localStorage,
    "test-editor-lang",
    defaultLang
  );
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

  const model = editor.createModel("");
  $effect(() => {
    model.setValue(contentStorage.load());
    editor.setModelLanguage(model, MONACO_LANGUAGE_ID[lang]);

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
  });

  const { terminal, fitAddon } = createTerminal();
  const streams = createStreams(terminal);

  const editorContext = new EditorContext(model, terminal, fitAddon);
  setEditorContext(editorContext);

  const editorWidthStorage = createSyncStorage(
    localStorage,
    "test-editor-width",
    Math.round((reactiveWindow.innerWidth / 3) * 2)
  );
  let editorWidth = $state(editorWidthStorage.load());
  debouncedSave(editorWidthStorage, () => editorWidth, 300);
  function normalizeWidth(width: number) {
    const windowWidth = reactiveWindow.innerWidth;
    const newEditorWidth = Math.max(
      EDITOR_MIN_WIDTH,
      Math.min(windowWidth, width)
    );
    const diff = windowWidth - newEditorWidth;
    if (windowWidth < DESCRIPTION_PANEL_MIN_WIDTH) {
      return newEditorWidth;
    }
    if (diff < DESCRIPTION_PANEL_FLIP_POINT) {
      return windowWidth;
    }
    if (diff < DESCRIPTION_PANEL_MIN_WIDTH) {
      return windowWidth - DESCRIPTION_PANEL_MIN_WIDTH;
    }
    return newEditorWidth;
  }
  let lastWindowWidth = reactiveWindow.innerWidth;
  $effect(() => {
    const newWidth = reactiveWindow.innerWidth;
    untrack(() => {
      editorWidth = normalizeWidth(editorWidth + newWidth - lastWindowWidth);
    });
    lastWindowWidth = newWidth;
  });

  const panelHeightStorage = createSyncStorage(
    localStorage,
    "test-editor-panel-height",
    Math.round(reactiveWindow.innerHeight / 3)
  );
  let panelHeight = $state(panelHeightStorage.load());
  debouncedSave(panelHeightStorage, () => panelHeight, 300);

  const vimStateStorage = createSyncStorage(
    localStorage,
    "test-editor-vim-state",
    false
  );
  let vimState = $state(vimStateStorage.load());
  immediateSave(vimStateStorage, () => vimState);

  const executionTimeoutStorage = createSyncStorage(
    localStorage,
    "test-editor-execution-timeout",
    60000
  );
  let executionTimeout = $state(executionTimeoutStorage.load());
  debouncedSave(executionTimeoutStorage, () => executionTimeout, 100);

  const terminalLogger = createLogger(streams.out);
  let testCompilerFactory = $derived(runtime.testCompilerFactory);
  let status = $state<ProcessStatus>("stopped");
  let lastTestId = $state(-1);
  let testCompiler: TestCompiler<Input, Output> | null = null;
  const compilerCtx = createRecoverableContext(() => {
    testCompiler = null;
    lastTestId = -1;
    return withCancel(createContext());
  });
  $effect(() => () => compilerCtx[Symbol.dispose]());
  $effect(() => {
    testCompilerFactory;
    compilerCtx.cancel();
    status = "stopped";
  });
  const programCtx = createRecoverableContext(() =>
    withCancel(compilerCtx.ref)
  );
  $effect(() => () => programCtx[Symbol.dispose]());

  async function handleRun() {
    if (status === "running") {
      compilerCtx.cancel();
      return;
    }
    const programCtxWithTimeout = withTimeout(programCtx.ref, executionTimeout);
    status = "running";
    terminal.reset();
    try {
      if (testCompiler === null) {
        testCompiler = await testCompilerFactory(compilerCtx.ref, streams);
      }
      const testProgram = await testCompiler.compile(programCtxWithTimeout, [
        {
          filename: "main",
          content: model.getValue(),
        },
      ]);
      lastTestId = await runTests(
        programCtxWithTimeout,
        terminalLogger,
        testProgram,
        testCases
      );
    } catch (err) {
      console.error(err);
      terminalLogger.error(stringifyError(err));
    } finally {
      programCtx.cancel();
      status = "stopped";
    }
  }

  function handleReset() {
    model.setValue(runtime.initialValue);
    editorContext.editor?.focus();
  }

  let descriptionDialogElement: HTMLDialogElement;
  let describedLanguage = $state(defaultLang);
  let Description = $derived(DESCRIPTIONS[describedLanguage]);
</script>

<div class="h-screen flex">
  <div
    class="h-full overflow-auto"
    style="width: {reactiveWindow.innerWidth - editorWidth}px"
  >
    <div class="p-6">
      <div class="flex gap-3 items-center mb-8">
        <Logo />
        <div class="breadcrumbs">
          <ul>
            <li>
              <a href={localizeHref(problemCategoryPage(problemCategory))}
                >{PROBLEM_CATEGORY_TO_LABEL[problemCategory]()}</a
              >
            </li>
          </ul>
        </div>
        <div class="join ml-auto rounded">
          <button class="btn btn-ghost btn-lg join-item"
            ><Icon icon="lucide:chevron-left" /></button
          >
          <button class="btn btn-ghost btn-lg join-item"
            ><Icon icon="lucide:chevron-right" /></button
          >
          <button class="btn btn-ghost btn-lg join-item"
            ><Icon icon="lucide:shuffle" /></button
          >
          <button onclick={handleReset} class="btn btn-ghost btn-lg join-item"
            ><Icon icon="lucide:rotate-ccw" /></button
          >
        </div>
      </div>
      <div class="prose prose-lg max-w-none">
        {@render children()}
      </div>
    </div>
  </div>
  <ResizablePanel
    normalizeSize={normalizeWidth}
    class="relative grow min-w-0 flex flex-col overflow-hidden"
    bind:size={editorWidth}
  >
    <Editor
      width={editorWidth}
      height={reactiveWindow.innerHeight - panelHeight}
    />
    <Panel bind:height={panelHeight} maxHeight={reactiveWindow.innerHeight}>
      <div class="flex flex-wrap items-center gap-1 p-1">
        <RunButton {status} onClick={handleRun} />
        <Tabs>
          <Tab tab={EditorPanelTab.Output} />
          <Tab tab={EditorPanelTab.Tests}>
            {#snippet append()}
              <div
                class={[
                  "badge rounded-xs",
                  lastTestId < 0 && "hidden",
                  lastTestId < testCases.length &&
                    lastTestId >= 0 &&
                    "badge-error",
                  lastTestId === testCases.length && "badge-success",
                ]}
              >
                {lastTestId}/{testCases.length}
              </div>
            {/snippet}
          </Tab>
          <Tab tab={EditorPanelTab.Settings} />
        </Tabs>
        <div class="grow"></div>
        <VimStatus bind:vimState />
        <Dropdown bind:value={lang} options={languages}>
          {#snippet preLabel(lang)}
            <Icon icon={LANGUAGE_ICONS[lang]} />
          {/snippet}
          {#snippet label(lang)}
            {LANGUAGE_TITLE[lang]}
          {/snippet}
          {#snippet postLabel(lang)}
            <Icon
              onclick={(e) => {
                describedLanguage = lang;
                e.stopPropagation();
                descriptionDialogElement.showModal();
              }}
              class="invisible group-hover:visible"
              icon="lucide:info"
            />
          {/snippet}
        </Dropdown>
        <PanelToggle
          bind:panelHeight
          maxPanelHeight={reactiveWindow.innerHeight}
        />
      </div>
      <div class="grow flex flex-col overflow-hidden">
        <TerminalTab
          width={reactiveWindow.innerWidth}
          height={panelHeight}
          class="grow ml-4 mt-4"
        />
        <TabContent tab={EditorPanelTab.Tests}>
          <div class="overflow-auto flex flex-col gap-4 p-4">
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
            <CheckBox title={m.vimMode()} bind:value={vimState} />
            <Number
              title={m.executionTimeout()}
              alt={m.executionTimeoutDescription()}
              bind:value={executionTimeout}
            />
          </div>
        </TabContent>
      </div>
    </Panel>
  </ResizablePanel>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={descriptionDialogElement}
  class="modal"
  onclick={(e) => e.stopPropagation()}
>
  <div class="modal-box max-w-2xl w-full">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
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
