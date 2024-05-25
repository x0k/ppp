<script lang="ts">
  import { onMount } from "svelte";
  import { editor } from "monaco-editor";

  import code from "@/example/code.php?raw";

  const model = editor.createModel(code, "php");

  let codeEditorElement: HTMLDivElement;

  onMount(() => {
    editor.create(codeEditorElement, {
      model: model,
      theme: "vs-dark",
      language: "php",
      automaticLayout: true,
    });
  });

  function log() {
    alert("Hello!");
  }
</script>

<div bind:this={codeEditorElement} class="grow"></div>
<div class="p-4 border-t border-base-100 flex items-center gap-3">
  <button onclick={log} class="btn btn-sm btn-primary"> Run </button>
  <button class="btn btn-sm btn-secondary"> Case 1 </button>
  <button class="btn btn-sm btn-secondary"> Case 2 </button>
  <select class="select select-ghost select-sm ml-auto">
    <option> PHP 8.2.11 </option>
  </select>
</div>
