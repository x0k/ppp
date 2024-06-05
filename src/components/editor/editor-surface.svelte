<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { editor } from "monaco-editor";

  import type { SyncStorage } from "@/shared";

  import Resizer, { Alignment, Orientation, Position } from './resizer.svelte';

  interface Props {
    model: editor.IModel;
    widthStorage: SyncStorage<number>;
    panel: Snippet<[{ resizer: Snippet }]>;
  }

  const { model, widthStorage, panel }: Props = $props();

  function normalizeWidth(width: number) {
    return Math.min(Math.max(width, 480), window.innerWidth);
  }

  const MIN_PANEL_HEIGHT = 32 + 1 // 1 for the resizer, when editor is maximized

  function normalizeHeight(height: number) {
    return Math.min(Math.max(height, 0), window.innerHeight - MIN_PANEL_HEIGHT);
  }

  let width = $state(normalizeWidth(widthStorage.load()));
  let height = $state(window.innerHeight - MIN_PANEL_HEIGHT);
  let start: { x: number, y: number };

  function onWindowResize() {
    if (window.innerWidth < width) {
      width = normalizeWidth(window.innerWidth)
    }
    if (window.innerHeight < height) {
      height = normalizeHeight(window.innerHeight)
    }
  }
  $effect(() => {
    window.addEventListener("resize", onWindowResize);
    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  });

  let ed: editor.IStandaloneCodeEditor;
  let editorElement: HTMLDivElement;

  $effect(() => {
    model;
    ed = editor.create(editorElement, {
      model,
      theme: "vs-dark",
      minimap: {
        enabled: false,
      },
    });
    untrack(() => {
      ed.layout({ width, height });
    })
    return () => ed.dispose();
  });
</script>

<div class="h-full flex flex-col relative bg-base-300" style="width: {width}px">
  <Resizer
    onMoveStart={(e) => {
      start = { x: e.clientX, y: $state.snapshot(width) }
    }}
    onMove={(e) => {
      width = normalizeWidth(start.x - e.clientX + start.y)
      ed.layout({ width, height }, true)
    }}
    onMoveEnd={() => {
      widthStorage.save(width)
    }}
  />
  <div bind:this={editorElement} class="relative" style="height: {height}px" ></div>
  {#snippet hResizer()}
    <Resizer
      orientation={Orientation.Horizontal}
      onMoveStart={(e) => {
        start = { x: $state.snapshot(height), y: e.clientY }
      }}
      onMove={(e) => {
        height = normalizeHeight(start.x - (start.y - e.clientY))
        ed.layout({ width, height }, true)
      }}
    />
  {/snippet}
  {@render panel({
    resizer: hResizer
  })}
</div>
