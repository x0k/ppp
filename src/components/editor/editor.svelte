<script lang="ts" generics="Lang extends Language, Input, Output">
  import { editor } from "monaco-editor";

  import {
    Language,
    type TestData,
    type TestRunnerFactory,
  } from "@/lib/testing";
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";
  import { createSyncStorage } from "@/adapters/storage";

  import EditorSurface from "./editor-surface.svelte";
  import LangSelect from "./lang-select.svelte";
  import Panel from "./panel/panel.svelte"
  import VimMode from './vim-mode.svelte';

  interface Props<L extends Language, I, O> {
    contentId: string;
    testsData: TestData<I, O>[];
    initialValues: Record<L, Promise<string>>;
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

  const model = editor.createModel("");

  function resetEditorContent () {
    initialValues[lang].then(value => {
      model.setValue(value);
    })
  }

  $effect(() => {
    langStorage.save(lang);
    resetEditorContent()
  });

  let monacoLang = $derived(MONACO_LANGUAGE_ID[lang]);

  $effect(() => {
    editor.setModelLanguage(model, monacoLang);
  });

  const widthStorage = createSyncStorage(
    localStorage,
    "editor-width",
    window.innerWidth - 800
  );
</script>

<EditorSurface contentId="{contentId}-{lang}" {model} {widthStorage} >
  {#snippet panel({ resizer, api })}
    <Panel
      {api}
      {model}
      {testsData}
      testRunnerFactory={testRunnerFactories[lang]}
      {resetEditorContent}
      children={resizer}
    >
      {#snippet header()}
        <VimMode {api} />
        <LangSelect bind:lang {languages} />
      {/snippet}
    </Panel>
  {/snippet}
</EditorSurface>
