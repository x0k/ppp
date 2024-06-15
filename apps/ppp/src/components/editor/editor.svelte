<script lang="ts" context="module">
  import type { TestData, TestRunnerFactory } from "testing";

  export interface Props<L extends Language, I, O> {
    contentId: string;
    testsData: TestData<I, O>[];
    runtimes: Record<L, {
      initialValue: string;
      testRunnerFactory: TestRunnerFactory<I, O>;
    }>
  }
</script>

<script lang="ts" generics="Lang extends Language, Input, Output">
  import { editor } from "monaco-editor";

  import { RESET_BUTTON_ID } from '@/shared';
  import {
    LANGUAGE_TITLE,
    Language,
  } from '@/lib/languages'
  import Select from '@/components/select.svelte';
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";
  import { createSyncStorage } from "@/adapters/storage";

  import Surface from "./surface.svelte";
  import Panel from "./panel/panel.svelte"
  import VimMode from './vim-mode.svelte';

  const {
    contentId,
    testsData,
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
</script>

<Surface bind:this={surface} {model} {widthStorage} >
  {#snippet panel({ resizer, api })}
    <Panel
      {api}
      {model}
      {testsData}
      testRunnerFactory={runtime.testRunnerFactory}
      children={resizer}
    >
      {#snippet header()}
        <VimMode {api} />
        <Select
          class="select-sm select-ghost"
          bind:value={lang}
          options={languages}
          labels={LANGUAGE_TITLE}
        />
      {/snippet}
    </Panel>
  {/snippet}
</Surface>
