<script lang="ts">
  import { EditorPanelTab } from "@/shared/editor-panel-tab";
  import '@xterm/xterm/css/xterm.css'

  import { getEditorContext } from "../context.svelte";
  import { getEditorPanelContext } from "./context.svelte";

  interface Props {
    class?: string;
  }
  const { class: className }: Props = $props();

  let termElement: HTMLDivElement;

  const editorCtx = getEditorContext();
  // NOTE: no `dispose` here
  // https://github.com/xtermjs/xterm.js/issues/3939#issuecomment-1195377718
  $effect(() => {
    editorCtx.terminal.open(termElement);
  });

  const ctx = getEditorPanelContext();
  let resizeFrameId: number;
  let isTerminalSelected = $derived(ctx.selectedTab === EditorPanelTab.Output);
  $effect(() => {
    ctx.height;
    if (!isTerminalSelected) {
      return;
    }
    cancelAnimationFrame(resizeFrameId);
    resizeFrameId = requestAnimationFrame(() => {
      // Fix the terminal resize to the smaller height
      editorCtx.terminal.resize(editorCtx.terminal.cols, 1);
      editorCtx.terminalFitAddon.fit();
    });
    return () => {
      cancelAnimationFrame(resizeFrameId);
    };
  });
</script>

<div
  bind:this={termElement}
  class={className}
  class:hidden={!isTerminalSelected}
></div>
