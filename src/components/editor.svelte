<script lang="ts" generics="R extends Runner">
  import type { Snippet } from "svelte";
  import { editor } from "monaco-editor";

  import {
  Language,
    RUNNER_LANGUAGES,
    RUNNER_TITLES,
    Runner,
  } from "@/lib/testing/runners";
  import { LANGUAGE_MONACO_LANGUAGES } from "@/adapters/monaco";

  interface Props {
    initialValue: string;
    runners: R[];
    defaultRunner?: R;
    children: Snippet<[R, editor.ITextModel]>;
    onLanguageChange?: (lang: Language, model: editor.ITextModel) => void;
  }

  const { initialValue, runners, defaultRunner, children, onLanguageChange }: Props = $props();

  let runner = $state(defaultRunner ?? runners[0]);

  let lang = $derived(RUNNER_LANGUAGES[runner]);
  
  $effect(() => {
    onLanguageChange?.(lang, model);
  });
  
  let monacoLang = $derived(LANGUAGE_MONACO_LANGUAGES[lang]);
  
  const model = editor.createModel(initialValue, $state.snapshot(monacoLang));

  $effect(() => {
    editor.setModelLanguage(model, $state.snapshot(monacoLang));
  });

  let editorElement: HTMLDivElement;

  $effect(() => {
    const ed = editor.create(editorElement, {
      model: model,
      theme: "vs-dark",
      automaticLayout: true,
    });
    return () => ed.dispose()
  });
</script>

<div bind:this={editorElement} class="grow"></div>
<div class="p-4 border-t border-base-100 flex items-center gap-3">
  {@render children(runner, model)}
  <select class="select select-ghost select-sm ml-auto" bind:value={runner}>
    {#each runners as runner (runner)}
      <option value={runner}>{RUNNER_TITLES[runner]}</option>
    {/each}
  </select>
</div>
