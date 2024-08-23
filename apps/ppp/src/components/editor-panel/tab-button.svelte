<script lang="ts">
  import type { Snippet } from 'svelte';

  import { TAB_TITLES, type Tab } from './model';

  interface Props {
    tab: Tab
    isSelected: boolean
    onClick: () => void
    append?: Snippet
  }

  const { tab, isSelected, onClick, append }: Props = $props();
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<span
  role="tab"
  class="tab"
  class:tab-with-badge={append}
  class:tab-active={isSelected}
  onclick={onClick}
>
  {TAB_TITLES[tab]}
  {#if append}
    {@render append()}
  {/if}
</span>
