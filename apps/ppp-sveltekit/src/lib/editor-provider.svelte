<script lang="ts">
	import type { Snippet } from 'svelte';

  import "monaco-editor";
  import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

  import { loadTmGrammars } from '$lib/monaco';

  window.MonacoEnvironment = {
    getWorker(_, label) {
      switch (label) {
        case "editorWorkerService":
          return new EditorWorker();
        case "javascript":
        case "typescript":
          return new TsWorker();
        default:
          throw new Error(`Unknown label ${label}`);
      }
    },
  };

  const promise = loadTmGrammars()

  const { children }: { children: Snippet } = $props()
</script>

{#await promise then}
  {@render children()}
{/await}

