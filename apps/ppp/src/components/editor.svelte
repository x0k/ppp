<script lang="ts">
  import { editor } from "monaco-editor";

  interface Props {
    model: editor.ITextModel;
    class?: string;
  }

  const { model, class: className }: Props = $props();

  let editorElement: HTMLDivElement;
  let ed = $state<editor.IStandaloneCodeEditor>();

  $effect(() => {
    ed = editor.create(editorElement, {
      model,
      theme: "vs-dark",
      fixedOverflowWidgets: true,
      lineNumbers: "on",
      tabSize: 2,
      insertSpaces: true,
      fontSize: 16,
      minimap: {
        enabled: false,
      },
      automaticLayout: true,
    });
    return () => {
      ed?.dispose();
    };
  });
</script>

<div bind:this={editorElement} class="w-full h-full {className}"></div>
