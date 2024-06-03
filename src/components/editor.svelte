<script lang="ts" generics="Lang extends Language">
  import type { Snippet } from "svelte";
  import { editor } from "monaco-editor";

  import {
    Language,
    LANGUAGE_TITLE,
  } from "@/lib/testing/languages";
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";

  interface Props {
    languages: Lang[];
    initialValue?: string;
    defaultLanguage?: Lang;
    children: Snippet<[Lang, editor.ITextModel]>;
    onLanguageChange?: (lang: Lang, model: editor.ITextModel) => void;
  }

  const { initialValue = "", languages, defaultLanguage, children, onLanguageChange }: Props = $props();

  let lang = $state(defaultLanguage ?? languages[0]);
  
  $effect(() => {
    onLanguageChange?.(lang, model);
  });
  
  let monacoLang = $derived(MONACO_LANGUAGE_ID[lang]);
  
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
  {@render children(lang, model)}
  <select class="select select-ghost select-sm ml-auto" bind:value={lang}>
    {#each languages as lang (lang)}
      <option value={lang}>{LANGUAGE_TITLE[lang]}</option>
    {/each}
  </select>
</div>
