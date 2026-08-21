<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
</script>

<div role="tablist" class="panel-tabs tabs">
	{@render children()}
</div>

<style>
	.panel-tabs :global {
		text-transform: uppercase;
		.tab:not(.tab-active) {
			--tab-color: oklch(var(--bc) / 0.5);
		}
	}
</style>
