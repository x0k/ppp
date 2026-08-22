<script lang="ts">
	import { Page } from '#lib/routes.ts';
	import { localizeHref } from '#lib/paraglide/runtime.js';
</script>

<a href={localizeHref(Page.Main)} class="avatar avatar-placeholder">
	<div class="w-12 rounded-md bg-base-200 text-neutral-content">
		<span class="text-xl">3P</span>
	</div>
</a>
