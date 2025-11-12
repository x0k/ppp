<script lang="ts">
	import Logo from '$lib/components/logo.svelte';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { Page } from '$lib/routes';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div class="navbar bg-base-100 max-w-4xl m-auto gap-3">
  <Logo />
  <span class="grow"> Programming Patterns Practice </span>
  <a class="link link-hover" href={localizeHref(Page.Editor)}
    >{m.editorPageTitle()}</a
  >
  <a class="link link-hover" href={localizeHref(Page.Problems)}
    >{m.problemsPageTitle()}</a
  >
</div>
<div class="flex justify-center">
	<main class="w-full max-w-[100vw] p-6 pb-10 lg:max-w-4xl">
		{@render children()}
	</main>
</div>
