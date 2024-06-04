<script lang="ts" context="module">
  export enum Orientation {
    Vertical = "vertical",
    Horizontal = "horizontal",
  }
</script>

<script lang="ts">
  interface Props {
    onMove: (e: MouseEvent) => void;
    onMoveStart?: (e: MouseEvent) => void;
    onMoveEnd?: (e: MouseEvent) => void;
    /**
     * @default Orientation.Vertical
     */
    orientation?: Orientation;
  }

  const {
    onMove,
    onMoveStart,
    onMoveEnd,
    orientation = Orientation.Vertical,
  }: Props = $props();

  let resizerElement: HTMLDivElement;

  function onEndMove(e: MouseEvent) {
    onMoveEnd?.(e);
    window.removeEventListener("mouseup", onEndMove);
    window.removeEventListener("mouseleave", onEndMove);
    window.removeEventListener("mousemove", onMove);
  }

  function onStartMove(e: MouseEvent) {
    onMoveStart?.(e);
    window.addEventListener("mouseup", onEndMove);
    window.addEventListener("mouseleave", onEndMove);
    window.addEventListener("mousemove", onMove);
  }

  $effect(() => {
    resizerElement.addEventListener("mousedown", onStartMove);
    return () => {
      resizerElement.removeEventListener("mousedown", onStartMove);
    };
  });
</script>

<div
  bind:this={resizerElement}
  class="absolute select-none z-50 h-full active:bg-primary hover:bg-primary/50"
  class:hover:cursor-col-resize={orientation === Orientation.Vertical}
  class:h-full={orientation === Orientation.Vertical}
  class:w-1={orientation === Orientation.Vertical}
  class:hover:cursor-row-resize={orientation === Orientation.Horizontal}
  class:w-full={orientation === Orientation.Horizontal}
  class:h-1={orientation === Orientation.Horizontal}
></div>
