<script lang="ts">
  import type { Snippet } from 'svelte';

  import { EditorPanelTab } from '@/shared/editor-panel-tab'

  import { getEditorPanelContext } from './context.svelte';
  import { EDITOR_PANEL_TAB_TO_LABEL } from '@/i18n';

  interface Props {
    tab: EditorPanelTab
    append?: Snippet
  }

  const { tab, append }: Props = $props();

  const ctx = getEditorPanelContext()
  const isSelected = $derived(ctx.selectedTab === tab)
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<span
  role="tab"
  class={[
    "tab",
    append && "tab-with-badge",
    isSelected && "tab-active"
  ]}
  onclick={() => {
    ctx.selectedTab = tab
  }}
>
  {EDITOR_PANEL_TAB_TO_LABEL[tab]()}
  {#if append}
    {@render append()}
  {/if}
</span>

<style>
  @reference "../../../global.css";
  .tab-with-badge {
    @apply flex gap-2 items-center;
  }
</style>
