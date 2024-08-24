<script lang="ts">
  import { editor } from "monaco-editor";

  import { getEditorContext } from "./context.svelte";

  interface Props {
    class?: string;
    height: number;
    width: number;
  }

  const { class: className, height, width }: Props = $props();

  const ctx = getEditorContext();

  let editorElement: HTMLDivElement;

  $effect(() => {
    ctx.editor = editor.create(editorElement, {
      model: ctx.model,
      theme: "vs-dark",
      fixedOverflowWidgets: true,
      lineNumbers: "on",
      tabSize: 2,
      insertSpaces: true,
      fontSize: 16,
      minimap: {
        enabled: false,
      },
    });
    return () => {
      ctx.editor?.dispose();
      ctx.editor = undefined;
    };
  });

  $effect(() => {
    if (!ctx.editor) {
      return;
    }
    ctx.editor.layout(
      {
        width: width,
        height: height,
      },
      true
    );
  });
</script>

<div bind:this={editorElement} class={className}></div>
