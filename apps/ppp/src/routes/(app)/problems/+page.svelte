<script lang="ts">
	import { PROBLEM_CATEGORIES, PROBLEM_CATEGORY_TO_LABEL } from '$lib/problem';
</script>

{#each PROBLEM_CATEGORIES as cat}
	<a href="./{cat}">{PROBLEM_CATEGORY_TO_LABEL[cat]()}</a>
{/each}
