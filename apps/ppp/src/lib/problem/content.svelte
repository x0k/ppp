<script lang="ts">
	import { marked } from 'marked';

	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	import type { ProblemMeta } from './model';

	const { meta, content: dirtyContent }: { meta: ProblemMeta; content: Record<string, string> } =
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
		return m.untranslated_content();
	});
</script>

<svelte:head>
	<title>{meta.titles[lang]}</title>
</svelte:head>

<h1 class="capitalize">{meta.titles[lang]}</h1>
{@html marked.parse(content)}
