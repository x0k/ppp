<script lang="ts">
  import type { Component } from "svelte";
  import { editor } from "monaco-editor";
  import Icon from '@iconify/svelte';

  import type { Compiler } from "libs/compiler";
  import type { Context } from "libs/context";
  import type { Writer } from "libs/io";

  import { reactiveWindow } from '@/lib/reactive-window.svelte'
  import { debouncedSave, immediateSave } from "@/lib/sync-storage.svelte";
  import { Language, LANGUAGE_ICONS, LANGUAGE_TITLE } from "@/shared/languages";
  import { EditorPanelTab } from '@/shared/editor-panel-tab';
  import type { Lang } from '@/i18n';
  import { createSyncStorage } from "@/adapters/storage";
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";
  import Dropdown from '@/components/dropdown.svelte';
  import {
    Editor,
    EditorContext,
    setEditorContext,
    VimMode,
    createTerminal,
  } from "@/components/editor2";
  import { Panel, Tab, Tabs, Terminal } from "@/components/editor2/panel";

  interface Props {
    lang: Lang
  }

  const { lang: pageLang }: Props = $props();

  type CompilerFactory = (ctx: Context, out: Writer) => Compiler;
  interface Runtime {
    initialValue: string;
    compilerFactory: CompilerFactory;
    Description: Component;
  }

  const RUNTIMES: Record<Language, Runtime> = {
    [Language.PHP]: { initialValue: "PHP" },
    [Language.TypeScript]: { initialValue: "TypeScript" },
    [Language.Python]: { initialValue: "Python" },
    [Language.JavaScript]: { initialValue: "JavaScript" },
    [Language.Go]: { initialValue: "Go" },
    [Language.Rust]: { initialValue: "Rust" },
    [Language.Gleam]: { initialValue: "Gleam" },
    [Language.CSharp]: { initialValue: "CSharp" },
    [Language.Java]: { initialValue: "Java" },
  };

  const languages = Object.keys(RUNTIMES) as Language[];
  const defaultLang = languages[0];
  const langStorage = createSyncStorage(
    localStorage,
    "editor-lang",
    defaultLang
  );
  const initialLang = langStorage.load();
  let lang = $state(initialLang in RUNTIMES ? initialLang : defaultLang);
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

  const { terminal, fitAddon } = createTerminal();

  setEditorContext(new EditorContext(
    pageLang,
    model,
    terminal,
    fitAddon,
  ));

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

  let descriptionDialogElement: HTMLDialogElement
  let describedLanguage = $state(defaultLang);
</script>

<div class="h-screen flex flex-col">
  <Editor width={reactiveWindow.innerWidth} height={reactiveWindow.innerHeight - panelHeight} />
  <Panel bind:height={panelHeight} maxHeight={reactiveWindow.innerHeight}>
    <div class="flex flex-wrap items-center gap-3 p-1">
      <Tabs>
        <Tab tab={EditorPanelTab.Output} />
      </Tabs>
      <div class="grow"></div>
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
      <VimMode bind:vimState />
    </div>
    <Terminal class="grow ml-4 mt-4" />
  </Panel>
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
      {RUNTIMES[describedLanguage].Description}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
