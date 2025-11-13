<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import type { Problem } from '$lib/problem';

	const problems = import.meta.glob<Problem>('./**/problem.ts', { eager: true, import: 'default' });

	const lang = getLocale();

	function getHref(path: string) {
		return `./${path.split('/')[2]}`;
	}
</script>

<div class="flex flex-col gap-2">
	{#each Object.entries(problems) as [path, p]}
		<a class="btn btn-outline" href={getHref(path)}>{p.titles[lang]}</a>
	{/each}
</div>
