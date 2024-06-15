<script lang="ts">
  import { initVimMode } from "monaco-vim";

  import { vimState, type SurfaceApi } from "./model";

  interface Props {
    api: SurfaceApi;
  }

  const { api }: Props = $props();

  let statusElement: HTMLDivElement;

  $effect(() => {
    if (!api.editor || !vimState.value) {
      return;
    }
    const mode = initVimMode(api.editor, statusElement);
    return () => {
      mode.dispose()
    }
  });
</script>

<div bind:this={statusElement}></div>
