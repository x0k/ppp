<script lang="ts">
	import { ProblemCategory } from '$lib/problem';
	import ProblemContent from '$lib/problem-content.svelte';
	import { type Runtime, TestEditor } from '$lib/test-editor';

	import { testCases, type Input, type Output } from './tests-data';

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

<TestEditor
	contentId={location.pathname}
	problemCategory={ProblemCategory.DesignPatterns}
	{testCases}
	{runtimes}
>
	<ProblemContent {content} />
</TestEditor>
