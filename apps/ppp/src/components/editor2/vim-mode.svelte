<script lang="ts">
  import { initVimMode } from "monaco-vim";

  import { getEditorContext } from "./context.svelte";

  interface Props {
    vimState: boolean;
    class?: string;
  }

  let { class: className, vimState = $bindable() }: Props = $props();

  let statusElement: HTMLDivElement;

  const ctx = getEditorContext();

  $effect(() => {
    if (!ctx.editor || !vimState) {
      return;
    }
    const mode = initVimMode(ctx.editor, statusElement);
    return () => {
      mode.dispose();
    };
  });
</script>

<div class={className} bind:this={statusElement}></div>
