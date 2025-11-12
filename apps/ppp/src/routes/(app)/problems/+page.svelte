<script lang="ts">
	import { PROBLEM_CATEGORIES, PROBLEM_CATEGORY_TO_LABEL } from '$lib/problem';
</script>

<div class="flex flex-col gap-2 capitalize">
	{#each PROBLEM_CATEGORIES as cat}
		<a class="btn btn-outline" href="./{cat}">{PROBLEM_CATEGORY_TO_LABEL[cat]()}</a>
	{/each}
</div>
