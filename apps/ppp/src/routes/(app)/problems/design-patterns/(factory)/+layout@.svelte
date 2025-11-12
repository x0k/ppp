<script lang="ts">
	import type { Snippet } from 'svelte';
  
	import { ProblemCategory, setCategoryContext } from '$lib/problem';

  const { children }: { children: Snippet } = $props()

  setCategoryContext({ category: ProblemCategory.DesignPatterns })
</script>

{@render children()}
