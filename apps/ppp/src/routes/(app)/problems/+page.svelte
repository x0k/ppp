<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import type { ProblemMeta } from '$lib/problem';

	const problems = import.meta.glob<ProblemMeta>('./[problem]/**/problem.ts', { eager: true, import: 'meta' });

	const lang = getLocale();

	function getHref(path: string) {
		const idx = path.lastIndexOf('/', path.length - 12) + 1
		return `./${path.slice(idx, -10)}`;
	}
</script>

<div class="flex flex-col gap-2">
	{#each Object.entries(problems) as [path, p]}
		<a class="btn btn-outline" href={getHref(path)}>{p.titles[lang]}</a>
	{/each}
</div>
