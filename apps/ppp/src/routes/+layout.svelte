<script lang="ts">
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import favicon from '$lib/assets/favicon.svg';
	// import scriptUrl from '$lib/assets/enable-threads?url';
	import { page } from '$app/state';
	import { TITLE } from '$lib/routes';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{TITLE}</title>
	<!-- <script src={scriptUrl}></script> -->
	<script
		data-goatcounter="https://ppp.counter.x0k.dev/count"
		async
		src="https://ppp.counter.x0k.dev/count.js"></script>
</svelte:head>

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>

{@render children()}
