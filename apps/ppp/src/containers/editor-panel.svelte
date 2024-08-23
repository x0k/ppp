<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { Vec2 } from '@/shared';
  import { createSyncStorage } from '@/adapters/storage';
  import Resizer, { Orientation } from '@/components/resizer.svelte';

  const PANEL_BORDER_HEIGHT = 1;
  const PANEL_HEADER_VERTICAL_PADDING = 4 * 2;
  const MIN_PANEL_HEIGHT =
    32 + PANEL_HEADER_VERTICAL_PADDING + PANEL_BORDER_HEIGHT;

  interface Props {
    maxHeight: number;
    children: Snippet
  }

  const { maxHeight, children }: Props = $props();

  function normalizeHeight(height: number) {
    return Math.min(Math.max(height, MIN_PANEL_HEIGHT), maxHeight);
  }

  const heightStorage = createSyncStorage(
    localStorage,
    "editor-panel-height",
    MIN_PANEL_HEIGHT
  )
  let height = $state(heightStorage.load());
  let saveHeightCallbackId: NodeJS.Timeout;
  $effect(() => {
    clearTimeout(saveHeightCallbackId);
    saveHeightCallbackId = setTimeout(() => {
      heightStorage.save(height);
    }, 1000);
    return () => {
      clearTimeout(saveHeightCallbackId);
    };
  })

  let start: Vec2;
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
