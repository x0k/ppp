<script lang="ts">
  import type { Snippet } from 'svelte';

  import { EditorPanelTab } from '@/shared/editor-panel-tab'
  import { useTranslations, getEditorPanelTabLabel } from '@/i18n';

  import { getEditorContext } from '../context.svelte';
  import { getEditorPanelContext } from './context.svelte';

  interface Props {
    tab: EditorPanelTab
    append?: Snippet
  }

  const { tab, append }: Props = $props();

  const editorCtx = getEditorContext()
  const t = useTranslations(editorCtx.lang)

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
  {t(getEditorPanelTabLabel(tab))}
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
