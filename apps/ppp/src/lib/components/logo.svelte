<script lang="ts">
  import { Page } from '$lib/routes';
  import { localizeHref } from '$lib/paraglide/runtime';
</script>

<a href={localizeHref(Page.Main)} class="avatar avatar-placeholder">
  <div class="bg-base-200 text-neutral-content rounded-md w-12">
    <span class="text-xl">3P</span>
  </div>
</a>
