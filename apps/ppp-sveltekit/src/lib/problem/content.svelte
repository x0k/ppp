<script lang="ts">
	import { marked } from 'marked';

	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	
	import type { Problem } from './model';

	const { problem, content: dirtyContent }: { problem: Problem; content: Record<string, string> } =
		$props();

	const lang = getLocale();
	const langs = $derived(Object.keys(dirtyContent));
	$effect(() => {
		if (langs.length === 0) {
			throw new Error('No content provided');
		}
	});
	const content = $derived.by(() => {
		for (const key of langs) {
			if (key.includes(lang)) {
				return dirtyContent[key];
			}
		}
		return m.currently_untranslated_problem();
	});
</script>

<svelte:head>
	<title>{problem.titles[lang]}</title>
</svelte:head>

<h1>{problem.titles[lang]}</h1>
{@html marked.parse(content)}
