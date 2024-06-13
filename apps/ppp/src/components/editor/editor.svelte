<script lang="ts" generics="Lang extends Language, Input, Output">
  import { editor } from "monaco-editor";

  import { RESET_BUTTON_ID } from '@/shared';
  import {
    LANGUAGE_TITLE,
    Language,
    type TestData,
    type TestRunnerFactory,
  } from "@/lib/testing";
  import Select from '@/components/select.svelte';
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";
  import { createSyncStorage } from "@/adapters/storage";

  import Surface from "./surface.svelte";
  import Panel from "./panel/panel.svelte"
  import VimMode from './vim-mode.svelte';

  interface Props<L extends Language, I, O> {
    contentId: string;
    testsData: TestData<I, O>[];
    initialValues: Record<L, string>;
    testRunnerFactories: Record<L, TestRunnerFactory<I, O>>;
  }

  const {
    contentId,
    testsData,
    initialValues,
    testRunnerFactories,
  }: Props<Lang, Input, Output> = $props();

  const languages = Object.keys(testRunnerFactories) as Lang[];
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
    initialLang in testRunnerFactories ? initialLang : defaultLang
  );
  let contentStorage = $derived(createSyncStorage(
    sessionStorage,
    `editor-${contentId}-${lang}`,
    initialValues[lang],
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
    model.setValue(initialValues[lang]);
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
      testRunnerFactory={testRunnerFactories[lang]}
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
