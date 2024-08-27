<script lang="ts">
  import { getRelativeLocaleUrl } from 'astro:i18n';

  import { Page } from '@/shared';
  import type { Lang } from '@/i18n';

  interface Props {
    lang: Lang
  }

  const { lang }: Props = $props();
</script>

<a href={getRelativeLocaleUrl(lang, Page.Main)} class="avatar placeholder">
  <div class="bg-base-300 text-neutral-content rounded-md w-12">
    <span class="text-xl">3P</span>
  </div>
</a>
