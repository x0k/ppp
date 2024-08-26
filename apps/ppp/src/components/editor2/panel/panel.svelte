<script lang="ts">
  import type { Snippet } from 'svelte';

  import { EditorPanelTab } from '@/shared/editor-panel-tab';
  import ResizablePanel, { Orientation } from '@/components/resizable-panel.svelte';

  import { EditorPanelContext, setEditorPanelContext } from './context.svelte';
  
  const PANEL_BORDER_HEIGHT = 1;
  const PANEL_HEADER_VERTICAL_PADDING = 4 * 2;
  const MIN_PANEL_HEIGHT =
    32 + PANEL_HEADER_VERTICAL_PADDING + PANEL_BORDER_HEIGHT;
  
  interface Props {
    height: number
    maxHeight: number;
    children: Snippet
  }

  let {
    height = $bindable(MIN_PANEL_HEIGHT),
    maxHeight,
    children
  }: Props = $props();

  function normalizeSize(height: number) {
    return Math.min(Math.max(height, MIN_PANEL_HEIGHT), maxHeight);
  }

  setEditorPanelContext(new EditorPanelContext(EditorPanelTab.Output));
</script>

<ResizablePanel
  class="grow border-t border-base-100 relative bg-base-300 flex flex-col overflow-hidden"
  orientation={Orientation.Horizontal}
  bind:size={height}
  {normalizeSize}
>
  {@render children()}
</ResizablePanel>
