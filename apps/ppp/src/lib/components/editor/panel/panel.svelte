<script lang="ts">
	import type { Snippet } from 'svelte';

	import { EditorPanelTab } from '$lib/editor-panel-tab';
	import ResizablePanel, { Orientation } from '$lib/components/resizable-panel.svelte';

	import { EditorPanelContext, setEditorPanelContext } from './context.svelte';
	import { MIN_PANEL_HEIGHT } from './model';

	interface Props {
		height: number;
		maxHeight: number;
		children: Snippet;
	}

	let { height = $bindable(), maxHeight, children }: Props = $props();

	function normalizeHeight(height: number) {
		return Math.min(Math.max(height, MIN_PANEL_HEIGHT), maxHeight);
	}

	setEditorPanelContext(new EditorPanelContext(EditorPanelTab.Output));
</script>

<ResizablePanel
	class="relative flex grow flex-col border-t border-base-100 bg-base-200"
	orientation={Orientation.Horizontal}
	bind:size={height}
	normalizeSize={normalizeHeight}
>
	{@render children()}
</ResizablePanel>
