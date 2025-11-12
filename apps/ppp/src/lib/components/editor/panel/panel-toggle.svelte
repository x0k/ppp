<script lang="ts">
  import { untrack } from "svelte";
  import LucideChevronDown from '~icons/lucide/chevron-down';
  import LucideChevronUp from '~icons/lucide/chevron-up';

  import { EditorPanelTab } from "$lib/editor-panel-tab";

  import { MIN_PANEL_HEIGHT } from "./model";
  import { getEditorPanelContext } from "./context.svelte";

  interface Props {
    panelHeight: number;
    maxPanelHeight: number;
  }

  let { panelHeight = $bindable(), maxPanelHeight }: Props = $props();

  const isCollapsed = $derived(panelHeight === MIN_PANEL_HEIGHT);
  let lastExpandedSize = Math.round(maxPanelHeight / 3);
  let lastSelectedTab: EditorPanelTab | undefined = EditorPanelTab.Output;

  const ctx = getEditorPanelContext();

  function deselectTab() {
    if (ctx.selectedTab) {
      lastSelectedTab = ctx.selectedTab;
      ctx.selectedTab = undefined;
    }
  }

  function selectTab() {
    if (!ctx.selectedTab) {
      ctx.selectedTab = lastSelectedTab;
    }
  }

  function expandPanel() {
    if (!isCollapsed) {
      return
    }
    panelHeight = lastExpandedSize;
    selectTab();
  }

  function collapsePanel() {
    lastExpandedSize = panelHeight;
    panelHeight = MIN_PANEL_HEIGHT;
    deselectTab();
  }

  $effect(() => {
    if (ctx.selectedTab) {
      untrack(expandPanel);
    }
  });

  $effect(() => {
    untrack(isCollapsed ? deselectTab : selectTab)
  })
</script>

<button class="btn btn-sm btn-ghost" onclick={isCollapsed ? expandPanel : collapsePanel}>
  {#if isCollapsed}
    <LucideChevronUp />
  {:else}
    <LucideChevronDown />
  {/if}
</button>
