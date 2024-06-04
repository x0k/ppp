<script lang="ts">
  interface Props {
    onMove: (e: MouseEvent) => void;
    onMoveStart?: (e: MouseEvent) => void;
    onMoveEnd?: (e: MouseEvent) => void;
  }

  const { onMove, onMoveStart, onMoveEnd }: Props = $props();

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
  class="absolute select-none w-1 z-50 h-full active:bg-primary hover:bg-primary/50 hover:cursor-col-resize"
></div>
