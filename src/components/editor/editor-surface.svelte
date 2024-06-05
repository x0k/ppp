<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { editor } from "monaco-editor";

  import type { SyncStorage } from "@/shared";

  import { type SurfaceApi } from './model'
  import Resizer, { Orientation } from './resizer.svelte';

  interface Props {
    model: editor.IModel;
    widthStorage: SyncStorage<number>;
    panel: Snippet<[{ resizer: Snippet, api: SurfaceApi }]>;
  }

  const { model, widthStorage, panel }: Props = $props();

  function normalizeWidth(width: number) {
    return Math.min(Math.max(width, 480), window.innerWidth);
  }

  const PANEL_BORDER_HEIGHT = 1
  const MIN_PANEL_HEIGHT = 32 + PANEL_BORDER_HEIGHT

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

  const api: SurfaceApi = {
    togglePanel (newHeight) {
      height = height < newHeight ? normalizeHeight(newHeight) : MIN_PANEL_HEIGHT
      ed.layout({ width, height }, true)
    },
    showPanel (newHeight) {
      const panelHeight = window.innerHeight - height
      if (panelHeight > MIN_PANEL_HEIGHT * 2) {
        return false
      }
      height = normalizeHeight(window.innerHeight - newHeight - PANEL_BORDER_HEIGHT)
      ed.layout({ width, height }, true)
      return true
    },
  }

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
  {#snippet resizer()}
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
    resizer,
    api
  })}
</div>
