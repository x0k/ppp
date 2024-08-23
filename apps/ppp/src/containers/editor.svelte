<script lang="ts" context="module">
  import type { Component, Snippet } from "svelte";
  import type { Compiler } from 'libs/compiler'
  import type { Context } from "libs/context";
  import type { Writer } from "libs/io";

  export type CompilerFactory = (ctx: Context, out: Writer) => Compiler;
  
  export interface Runtime {
    initialValue: string;
    compilerFactory: CompilerFactory;
    Description: Component;
  }
</script>

<script lang="ts" generics="Lang extends Language">
  import { editor } from "monaco-editor";
  
  import { Language } from "@/shared/languages";
  import Editor from "@/components/editor.svelte";
  import { createSyncStorage } from "@/adapters/storage";
  import { MONACO_LANGUAGE_ID } from "@/adapters/monaco";
  
  interface Props<L extends Language> {
    runtimes: Record<L, Runtime>;
    panel?: Snippet<[Language]>
  }
  const { panel, runtimes }: Props<Lang> = $props();

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
  let contentStorage = $derived(
    createSyncStorage(sessionStorage, `editor-${lang}`, runtime.initialValue)
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
</script>

<Editor {model} />
{#if panel}
  {@render panel(lang)}
{/if}
