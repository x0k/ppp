<script lang="ts">
	import type { Snippet } from 'svelte';

	import Logo from '$lib/components/logo.svelte';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { Page, TITLE } from '$lib/routes';

	const { children }: { children: Snippet } = $props();
</script>

<div class="navbar m-auto max-w-4xl gap-3 bg-base-100 capitalize">
	<Logo />
	<span class="grow"> {TITLE} </span>
	<a class="link link-hover" href={localizeHref(Page.Editor)}>{m.editor()}</a>
	<a class="link link-hover" href={localizeHref(Page.Problems)}>{m.problems()}</a>
</div>
<div class="flex justify-center">
	<main class="w-full max-w-[100vw] p-6 pb-10 lg:max-w-4xl">
		{@render children()}
	</main>
</div>
