<script lang="ts">
	import { deLocalizeHref } from '$lib/paraglide/runtime';
	import { Content, type Runtime, getCategoryContext } from '$lib/problem';
	import Editor from '$lib/problem/editor.svelte';

	import problem from './problem';
	import { testCases, type Input, type Output } from './tests-data';

	const catCtx = getCategoryContext()
	const runtimes = import.meta.glob<Runtime<Input, Output>>('./*/index.ts', {
		base: './runtimes',
		eager: true
	});
	const content = import.meta.glob<string>('./*.md', {
		base: './content',
		import: 'default',
		query: '?raw',
		eager: true,
	});
</script>

<Editor
	contentId={deLocalizeHref(location.pathname)}
	problemCategory={catCtx.category}
	{testCases}
	{runtimes}
>
	<Content {problem} {content} />
</Editor>
