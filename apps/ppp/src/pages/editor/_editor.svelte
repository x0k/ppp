<script lang="ts">
  import { editor } from "monaco-editor";
  import Icon from "@iconify/svelte";

  import type { Compiler, Program } from "compiler";
  import {
    createContext,
    createRecoverableContext,
    withCancel,
    withTimeout,
  } from "libs/context";
  import { createLogger } from "libs/logger";
  import { stringifyError } from "libs/error";

  import { reactiveWindow } from "@/lib/reactive-window.svelte";
  import { debouncedSave, immediateSave } from "@/lib/sync-storage.svelte";
  import { Language, LANGUAGE_ICONS, LANGUAGE_TITLE } from "@/shared/languages";
  import { EditorPanelTab } from "@/shared/editor-panel-tab";
  import { Label, type Lang } from "@/i18n";
  import { createSyncStorage } from "@/adapters/storage";
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";
  import { DESCRIPTIONS } from "@/adapters/runtime/descriptions";
  import Dropdown from "@/components/dropdown.svelte";
  import {
    Editor,
    EditorContext,
    setEditorContext,
    VimStatus,
    createTerminal,
    RunButton,
    type ProcessStatus,
  } from "@/components/editor";
  import {
    Panel,
    Tab,
    Tabs,
    TerminalTab,
    TabContent,
    PanelToggle,
  } from "@/components/editor/panel";
  import { CheckBox, Number } from "@/components/editor/controls";

  import { RUNTIMES } from "./_runtimes";

  interface Props {
    lang: Lang;
  }

  const { lang: pageLang }: Props = $props();

  const languages = Object.keys(RUNTIMES).sort() as Language[];
  if (languages.length === 0) {
    throw new Error("No test runner factories provided");
  }
  const defaultLang = languages[0];
  const langStorage = createSyncStorage(
    localStorage,
    "editor-lang",
    defaultLang
  );
  const initialLang = langStorage.load();
  let lang = $state(initialLang in RUNTIMES ? initialLang : defaultLang);
  immediateSave(langStorage, () => lang);
  let runtime = $derived(RUNTIMES[lang]);
  let contentStorage = $derived(
    createSyncStorage(
      sessionStorage,
      `editor-content-${lang}`,
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

  const { terminal, fitAddon, streams } = createTerminal();

  setEditorContext(new EditorContext(pageLang, model, terminal, fitAddon));

  const panelHeightStorage = createSyncStorage(
    localStorage,
    "editor-panel-height",
    Math.round(reactiveWindow.innerHeight / 3)
  );
  let panelHeight = $state(panelHeightStorage.load());
  debouncedSave(panelHeightStorage, () => panelHeight, 300);

  const vimStateStorage = createSyncStorage(
    localStorage,
    "editor-vim-state",
    false
  );
  let vimState = $state(vimStateStorage.load());
  immediateSave(vimStateStorage, () => vimState);

  const executionTimeoutStorage = createSyncStorage(
    localStorage,
    "editor-execution-timeout",
    60000
  );
  let executionTimeout = $state(executionTimeoutStorage.load());
  debouncedSave(executionTimeoutStorage, () => executionTimeout, 100);

  const terminalLogger = createLogger(streams.out);
  let compilerFactory = $derived(runtime.compilerFactory);
  let status = $state<ProcessStatus>("stopped");
  let compiler: Compiler<Program> | null = null;
  const compilerCtx = createRecoverableContext(() => {
    compiler = null;
    return withCancel(createContext());
  });
  $effect(() => () => compilerCtx[Symbol.dispose]());
  $effect(() => {
    compilerFactory;
    compilerCtx.cancel();
    status = "stopped";
  });
  const programCtx = createRecoverableContext(() =>
    withCancel(compilerCtx.ref)
  );
  $effect(() => () => programCtx[Symbol.dispose]());

  async function handleRun() {
    if (status === "running") {
      // At the moment, programs do not know how to stop
      // So the only way to stop them is to kill the worker
      // But in the future we can use `programCtxWithCancel[1]` to stop programs normally
      compilerCtx.cancel();
      return;
    }
    const programCtxWithTimeout = withTimeout(
      programCtx.ref,
      executionTimeout
    );
    status = "running";
    terminal.reset();
    try {
      if (compiler === null) {
        compiler = await compilerFactory(
          compilerCtx.ref,
          streams,
        );
      }
      const program = await compiler.compile(programCtxWithTimeout, [
        {
          filename: "main",
          content: model.getValue(),
        },
      ]);
      await program.run(programCtxWithTimeout);
    } catch (err) {
      console.error(err);
      terminalLogger.error(stringifyError(err));
    } finally {
      programCtx.cancel();
      status = "stopped";
    }
  }

  let descriptionDialogElement: HTMLDialogElement;
  let describedLanguage = $state(defaultLang);
  let Description = $derived(DESCRIPTIONS[describedLanguage]);
</script>

<div class="h-screen flex flex-col overflow-hidden">
  <Editor
    width={reactiveWindow.innerWidth}
    height={reactiveWindow.innerHeight - panelHeight}
  />
  <Panel bind:height={panelHeight} maxHeight={reactiveWindow.innerHeight}>
    <div class="flex flex-wrap items-center gap-1 p-1">
      <RunButton {status} onClick={handleRun} />
      <Tabs>
        <Tab tab={EditorPanelTab.Output} />
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
        {#snippet children()}
          <li>
            <a target="_blank" href="https://github.com/x0k/ppp">
              <Icon icon="lucide:github" />
              <span class="font-[sans-serif]"> GitHub </span>
            </a>
          </li>
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
      <TabContent tab={EditorPanelTab.Settings}>
        <div class="overflow-auto flex flex-col gap-4 p-4">
          <CheckBox title={Label.EditorSettingsVimMode} bind:value={vimState} />
          <Number
            title={Label.EditorSettingsExecutionTimeout}
            alt={Label.EditorSettingsExecutionTimeoutAlt}
            bind:value={executionTimeout}
          />
        </div>
      </TabContent>
    </div>
  </Panel>
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
