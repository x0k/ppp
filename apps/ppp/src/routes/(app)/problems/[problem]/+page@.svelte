<script lang="ts" module>
	const problems = import.meta.glob<Problem<unknown, unknown>>('./**/problem.ts', {
		import: 'default'
	})
</script>

<script lang="ts">
	import { deLocalizeHref } from '$lib/paraglide/runtime';
	import { Content, type Problem } from '$lib/problem';
	import Editor from '$lib/problem/editor.svelte';
	import { m } from '$lib/paraglide/messages';

	import { page } from '$app/state'

	const key = $derived(Object.keys(problems).find(p => p.endsWith(`${page.params.problem}/problem.ts`)));
</script>

{#if key}
	{#await problems[key]() then p}
		<Editor
			contentId={deLocalizeHref(location.pathname)}
			problemCategory={p.meta.category}
			testCases={p.testCases}
			runtimes={p.runtimes}
		>
			<Content meta={p.meta} content={p.content} />
		</Editor>
	{/await}
{:else}
	<div class="h-screen flex flex-col items-center justify-center gap-4">
		<p>{m.problem_name_not_found({ name: page.params.problem! })}</p>
		<a class="btn" href="../" >{m.back_to_problems()}</a>
	</div>
{/if}
