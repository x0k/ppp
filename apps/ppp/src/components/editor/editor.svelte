<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { TestCase, TestCompilerFactory } from "testing";
  export interface Runtime<I, O> {
    initialValue: string;
    testRunnerFactory: TestCompilerFactory<I, O>;
    Description: Component
  }

  export interface Props<L extends Language, I, O> {
    contentId: string;
    testCases: TestCase<I, O>[];
    runtimes: Record<L, Runtime<I, O>>
  }
</script>

<script lang="ts" generics="Lang extends Language, Input, Output">
  import { editor } from "monaco-editor";
  import Icon from '@iconify/svelte'

  import { RESET_BUTTON_ID } from '@/shared';
  import {
    LANGUAGE_TITLE,
    Language,
  } from '@/shared/languages'
  import Dropdown from '@/components/dropdown.svelte';
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";
  import { createSyncStorage } from "@/adapters/storage";

  import { LANG_ICONS } from './model'
  import Surface from "./surface.svelte";
  import Panel from "./panel/panel.svelte"
  import VimMode from '../../containers/editor/vim-mode.svelte';

  const {
    contentId,
    testCases,
    runtimes,
  }: Props<Lang, Input, Output> = $props();

  const languages = Object.keys(runtimes) as Lang[];
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

  let lang = $state(
    initialLang in runtimes ? initialLang : defaultLang
  );
  let runtime = $derived(runtimes[lang]);
  let contentStorage = $derived(createSyncStorage(
    sessionStorage,
    `editor-${contentId}-${lang}`,
    runtime.initialValue,
  ));

  const model = editor.createModel("");

  $effect(() => {
    model.setValue(contentStorage.load());
    editor.setModelLanguage(model, MONACO_LANGUAGE_ID[lang]);
    langStorage.save(lang);

    let saveCallbackId: NodeJS.Timeout
    const disposable = model.onDidChangeContent(() => {
      clearTimeout(saveCallbackId)
      saveCallbackId = setTimeout(() => {
        contentStorage.save(model.getValue());
      }, 1000)
      return () => {
        clearTimeout(saveCallbackId)
      }
    })
    return () => {
      clearTimeout(saveCallbackId)
      disposable.dispose()
    }
  })
  
  const widthStorage = createSyncStorage(
    localStorage,
    "editor-width",
    window.innerWidth - 800
  );

  let surface: Surface

  function resetEditorContent () {
    contentStorage.clear();
    model.setValue(runtime.initialValue);
    surface.api.editor?.focus();
  }

  $effect(() => {
    const button = document.getElementById(RESET_BUTTON_ID)
    if (!button) {
      return
    }
    button.addEventListener("click", resetEditorContent)
    return () => {
      button.removeEventListener("click", resetEditorContent)
    }
  })

  let dialogElement: HTMLDialogElement
  let selectedLang: Lang = $state(defaultLang)
</script>

<Surface bind:this={surface} {model} {widthStorage} >
  {#snippet panel({ resizer, api })}
    <Panel
      {api}
      {model}
      {testCases}
      testCompilerFactory={runtime.testRunnerFactory}
      children={resizer}
    >
      {#snippet header()}
        <VimMode {api} />
        <Dropdown
          bind:value={lang}
          options={languages}
        >
          {#snippet preLabel(lang)}
            <Icon icon={LANG_ICONS[lang]} />
          {/snippet}
          {#snippet label(lang)}
            {LANGUAGE_TITLE[lang]}
          {/snippet}
          {#snippet postLabel(lang)}
            <Icon onclick={(e) => {
              selectedLang = lang
              e.stopPropagation()
              dialogElement.showModal()
            }} class="invisible group-hover:visible" icon="lucide:info" />
          {/snippet}
        </Dropdown>
      {/snippet}
    </Panel>
  {/snippet}
</Surface>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialogElement} class="modal" onclick={(e) => e.stopPropagation()}>
  <div class="modal-box max-w-2xl w-full">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 class="text-lg font-bold">{LANGUAGE_TITLE[selectedLang]}</h3>
    <div class="flex flex-col items-start gap-2 py-4">
      {runtimes[selectedLang].Description}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
