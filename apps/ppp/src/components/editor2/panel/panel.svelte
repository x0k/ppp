<script lang="ts" module>
  const PANEL_BORDER_HEIGHT = 1;
  const PANEL_HEADER_VERTICAL_PADDING = 4 * 2;
  export const MIN_PANEL_HEIGHT =
    32 + PANEL_HEADER_VERTICAL_PADDING + PANEL_BORDER_HEIGHT;
</script>
<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { Vec2 } from '@/lib/vec2';
  import Resizer, { Orientation } from '@/components/resizer.svelte';
  import { EditorPanelContext, setEditorPanelContext } from './context.svelte';

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

  function normalizeHeight(height: number) {
    return Math.min(Math.max(height, MIN_PANEL_HEIGHT), maxHeight);
  }

  let start: Vec2;

  setEditorPanelContext(new EditorPanelContext(() => height));
</script>

<div class="grow border-t border-base-100 relative bg-base-300 flex flex-col" style="height: {height}px;" >
  <Resizer
    orientation={Orientation.Horizontal}
    onMoveStart={(e) => {
      start = { x: $state.snapshot(height), y: e.clientY }
    }}
    onMove={(e) => {
      height = normalizeHeight((start.y - e.clientY) + start.x)
    }}
  />
  {@render children()}
</div>
