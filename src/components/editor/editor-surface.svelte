<script lang="ts">
  import type { Snippet } from 'svelte';
  import { editor } from "monaco-editor";

  import type { Position, SyncStorage } from "@/shared";
  import Resizer, { Alignment, Orientation } from './resizer.svelte';

  interface Props {
    model: editor.IModel;
    widthStorage: SyncStorage<number>;
    children: Snippet
  }

  const { model, widthStorage, children }: Props = $props();

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
    return () => ed.dispose();
  });

  function normalizeWidth(width: number) {
    return Math.min(Math.max(width, 480), window.innerWidth);
  }

  const RESIZER_HEIGHT = 4
  const MIN_PANEL_HEIGHT = 32 + RESIZER_HEIGHT

  function normalizeHeight(height: number) {
    return Math.min(Math.max(height, RESIZER_HEIGHT), window.innerHeight - MIN_PANEL_HEIGHT);
  }

  let width = $state(normalizeWidth(widthStorage.load()));
  let height = $state(window.innerHeight - MIN_PANEL_HEIGHT);
  let start: Position;

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
</script>

<div class="h-full flex flex-col relative bg-base-300 min-w-[480px]">
  <Resizer
    onMoveStart={(e) => {
      start = { x: e.clientX, y: $state.snapshot(width) }
    }}
    onMove={(e) => {
      width = normalizeWidth(start.x - e.clientX + start.y)
      ed.layout({ width, height })
    }}
    onMoveEnd={() => {
      widthStorage.save(width)
    }}
  />
  <div bind:this={editorElement} class="relative" style="width: {width}px; height: {height}px" >
    <Resizer
      orientation={Orientation.Horizontal}
      alignment={Alignment.End}
      onMoveStart={(e) => {
        start = { x: $state.snapshot(height), y: e.clientY }
      }}
      onMove={(e) => {
        height = normalizeHeight(start.x - (start.y - e.clientY))
        ed.layout({ width, height })
      }}
    />
  </div>
  <div class="border-t border-base-100 relative flex flex-col grow">
    {@render children()}
  </div>
</div>
