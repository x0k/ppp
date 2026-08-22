<script lang="ts">
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { ProblemMeta } from '#lib/problem/index.ts';

	const problems = import.meta.glob<ProblemMeta>('./\\[problem\\]/**/problem.ts', {
		eager: true,
		import: 'meta'
	});

	const lang = getLocale();

	function getHref(path: string) {
		const idx = path.lastIndexOf('/', path.length - 12) + 1;
		return `./${path.slice(idx, -10)}`;
	}
</script>

<div class="flex flex-col gap-2">
	{#each Object.entries(problems) as [path, p] (path)}
		<a class="btn btn-outline" href={getHref(path)}>{p.titles[lang]}</a>
	{/each}
</div>
