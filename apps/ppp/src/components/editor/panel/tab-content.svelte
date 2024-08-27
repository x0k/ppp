<script lang="ts">
  import type { Snippet } from 'svelte';
  
  import { EditorPanelTab } from '@/shared/editor-panel-tab';
  
  import { getEditorPanelContext } from './context.svelte';

  interface Props {
    tab: EditorPanelTab
    children: Snippet
  }

  const { tab, children }: Props = $props();

  const ctx = getEditorPanelContext();
</script>

{#if ctx.selectedTab === tab}
  {@render children()}
{/if}
