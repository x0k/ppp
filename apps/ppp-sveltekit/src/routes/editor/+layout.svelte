<script lang="ts">
	import type { Snippet } from 'svelte';

  import EditorProvider from '$lib/editor-provider.svelte';

  const { children }: { children: Snippet } = $props()
</script>

<EditorProvider {children} />
