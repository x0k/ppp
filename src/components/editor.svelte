<script lang="ts">
  import { editor } from "monaco-editor";
  import { WebPHP } from "@php-wasm/web";

  import code from "@/example/code.php?raw";

  import EditorPanel from "./editor-panel.svelte";

  const model = editor.createModel(code, "php");

  let codeEditorElement: HTMLDivElement;

  $effect(() => {
    editor.create(codeEditorElement, {
      model: model,
      theme: "vs-dark",
      language: "php",
      automaticLayout: true,
    });
  });

  const phpPromise = WebPHP.load("8.3");
</script>

<div bind:this={codeEditorElement} class="grow"></div>
<div class="p-4 border-t border-base-100 flex items-center gap-3">
  {#await phpPromise}
    <span>Loading...</span>
  {:then php}
    <EditorPanel {php} {model} />
  {:catch error}
    <span>Error: {error.message}</span>
  {/await}
  <select class="select select-ghost select-sm ml-auto">
    <option> PHP 8.3 </option>
  </select>
</div>
