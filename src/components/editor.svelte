<script lang="ts" generics="Lang extends Language">
  import type { Snippet } from "svelte";
  import { editor } from "monaco-editor";

  import {
    Language,
    LANGUAGE_TITLE,
  } from "@/lib/testing/languages";
  import type { Position, SyncStorage } from '@/shared';
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";

  import Resizer, { Orientation } from './resizer.svelte';

  interface Props {
    languages: Lang[];
    initialValue?: string;
    defaultLanguage?: Lang;
    children: Snippet<[Lang, editor.ITextModel]>;
    onLanguageChange?: (lang: Lang, model: editor.ITextModel) => void;
    widthStorage: SyncStorage<number>
  }

  const {
    initialValue = "",
    languages,
    defaultLanguage,
    children,
    onLanguageChange,
    widthStorage,
  }: Props = $props();

  let lang = $state(defaultLanguage ?? languages[0]);
  
  $effect(() => {
    onLanguageChange?.(lang, model);
  });
  
  let monacoLang = $derived(MONACO_LANGUAGE_ID[lang]);
  
  const model = editor.createModel(initialValue);

  $effect(() => {
    editor.setModelLanguage(model, $state.snapshot(monacoLang));
  });

  let ed: editor.IStandaloneCodeEditor;
  let editorElement: HTMLDivElement;

  $effect(() => {
    ed = editor.create(editorElement, {
      model: model,
      theme: "vs-dark",
      minimap: {
        enabled: false
      }
    });
    return () => ed.dispose()
  });

  let windowWidth = $state(window.innerWidth)
  function onWindowResize() {
    windowWidth = window.innerWidth
  }
  $effect(() => {
    window.addEventListener("resize", onWindowResize)
    return () => {
      window.removeEventListener("resize", onWindowResize)
    }
  })

  function normalizeWidth(width: number) {
    return Math.min(Math.max(width, 480), windowWidth)
  }

  let width = $state(normalizeWidth(widthStorage.load()))
  let start: Position
  let info: editor.EditorLayoutInfo

</script>

<div class="h-full flex flex-col relative bg-base-300">
  <Resizer
    onMoveStart={(e) => {
      start = { x: e.clientX, y: e.clientY }
      info = ed.getLayoutInfo();
    }}
    onMove={(e) => {
      width = normalizeWidth(start.x - e.clientX + info.width)
      ed.layout({
        width: width,
        height: info.height
      })
    }}
    onMoveEnd={() => {
      widthStorage.save(width)
    }}
  />
  <div bind:this={editorElement} class="grow" style="width: {width}px" ></div>
  <div class="border-t border-base-100 relative">
    <Resizer orientation={Orientation.Horizontal} onMove={console.log} />
    <div class="flex items-center gap-3" >
    {@render children(lang, model)}
    <select class="select select-ghost select-sm ml-auto" bind:value={lang}>
      {#each languages as lang (lang)}
        <option value={lang}>{LANGUAGE_TITLE[lang]}</option>
      {/each}
    </select>
    </div>
  </div>
</div>
