<script lang="ts" module>
  export { Alignment, Orientation } from './resizer.svelte'
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  import type { Vec2 } from '@/lib/vec2';

  import Resizer, { Alignment, Orientation } from "./resizer.svelte";

  interface Props {
    size: number;
    children: Snippet;
    /**
     * @default Orientation.Vertical
     */
    orientation?: Orientation;
    /**
     * @default Alignment.Start
     */
    alignment?: Alignment;
    normalizeSize?: (size: number) => number;
    class?: string;
  }

  let {
    size = $bindable(),
    orientation = Orientation.Vertical,
    alignment = Alignment.Start,
    children,
    class: className,
    normalizeSize = (size) => size,
  }: Props = $props();

  const ORIENTATION_TO_STYLE: Record<Orientation, "height" | "width"> = {
    [Orientation.Horizontal]: "height",
    [Orientation.Vertical]: "width",
  };

  const ORIENTATION_TO_COORD: Record<Orientation, "clientX" | "clientY"> = {
    [Orientation.Horizontal]: "clientY",
    [Orientation.Vertical]: "clientX",
  };

  const ORIENTATION_TO_OPERATION: Record<Orientation, (a: number, b: number, c: number) => number> = {
    [Orientation.Horizontal]: (a, b, c) => a - b + c,
    [Orientation.Vertical]: (a, b, c) => a + b - c,
  }

  const sizeProp = $derived(ORIENTATION_TO_STYLE[orientation]);
  const coord = $derived(ORIENTATION_TO_COORD[orientation]);
  const op = $derived(ORIENTATION_TO_OPERATION[orientation]);

  let start: Vec2;
</script>

<div class={className} style="{sizeProp}: {size}px" >
  <Resizer
    {orientation}
    {alignment}
    onMoveStart={(e) => {
      start = { x: size, y: e[coord] };
    }}
    onMove={(e) => {
      size = normalizeSize(op(start.y, e[coord], start.x));
    }}
  />
  {@render children()}
</div>
