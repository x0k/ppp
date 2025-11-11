<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<div role="tablist" class="tabs panel-tabs">
  {@render children()}
</div>

<style>
  @reference "../../../../app.css";
  .panel-tabs :global {
    @apply uppercase;
    .tab:not(.tab-active) {
      --tab-color: oklch(var(--bc) / 0.5);
    }
  }
</style>
