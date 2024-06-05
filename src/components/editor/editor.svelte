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
  import TestingPanel from "./testing-panel.svelte";

  interface Props<L extends Language, I, O> {
    initialValue?: string;
    initialLanguage?: L;
    onLanguageChange?: (lang: L, model: editor.ITextModel) => void;
    testData: TestData<I, O>[];
    testRunnerFactories: Record<L, TestRunnerFactory<I, O>>;
  }

  const {
    initialLanguage,
    onLanguageChange,
    initialValue = "",
    testData,
    testRunnerFactories,
  }: Props<Lang, Input, Output> = $props();

  const languages = Object.keys(testRunnerFactories) as Lang[];
  if (languages.length === 0) {
    throw new Error("No test runner factories provided");
  }
  const defaultLang = initialLanguage ?? languages[0];
  const langStorage = createSyncStorage(
    localStorage,
    "editor-lang",
    defaultLang
  );
  const initialLang = langStorage.load();

  let lang = $state(
    initialLang in testRunnerFactories ? initialLang : defaultLang
  );

  const model = editor.createModel(initialValue);

  $effect(() => {
    onLanguageChange?.(lang, model);
    langStorage.save(lang);
  });

  let monacoLang = $derived(MONACO_LANGUAGE_ID[lang]);

  $effect(() => {
    editor.setModelLanguage(model, $state.snapshot(monacoLang));
  });

  const widthStorage = createSyncStorage(
    localStorage,
    "editor-width",
    window.innerWidth - 800
  );
</script>

<EditorSurface {model} {widthStorage}>
  <div class="flex items-center gap-3">
    <TestingPanel
      {model}
      {testData}
      testRunnerFactory={testRunnerFactories[lang]}
    />
    <LangSelect bind:lang {languages} />
  </div>
</EditorSurface>
