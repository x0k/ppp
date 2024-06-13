<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from '@iconify/svelte';

  import { type SurfaceApi } from '../model';
  import { Tab, TAB_TITLES } from './model';

  interface Props {
    isRunning: boolean;
    testsCount: number;
    lastTestId: number;
    selectedTab: Tab;
    api: SurfaceApi;
    onRun: () => void;
    append: Snippet;
  }

  let {
    selectedTab = $bindable(),
    isRunning,
    testsCount,
    lastTestId,
    api,
    append,
    onRun
  }: Props = $props();

  interface TabButtonProps { tab: Tab, append?: Snippet }
</script>

<div class="flex flex-wrap items-center gap-3 p-1">
  <button
    class="btn btn-sm btn-primary"
    onclick={onRun}
  >
    {#if isRunning}
      <span class="loading loading-spinner"></span>
      Stop
    {:else}
      <Icon class="w-6" icon="lucide:play" />
      Run
    {/if}
  </button>
  <div role="tablist" class="tabs panel-tabs">
    {#snippet tabButton({ tab, append }: TabButtonProps)}
      <a
        href="#top"
        role="tab"
        class="tab"
        class:tab-with-badge={append}
        class:tab-active={selectedTab === tab}
        onclick={() => {
          selectedTab = tab
          api.showPanel(window.innerHeight/3)
        }}
      >
        {TAB_TITLES[tab]}
        {#if append}
          {@render append()}
        {/if}
      </a>
    {/snippet}
    {#snippet testBadge()}
      <div
        class="badge"
        class:hidden={lastTestId < 0}
        class:badge-success={lastTestId === testsCount}
        class:badge-error={lastTestId < testsCount && lastTestId >= 0}
      >
        {lastTestId}/{testsCount}
      </div>
    {/snippet}
    {@render tabButton({ tab: Tab.Tests, append: testBadge })}
    {@render tabButton({ tab: Tab.Output })}
    {@render tabButton({ tab: Tab.Settings })}
  </div>
  <div class="grow" ></div>
  {@render append()}
  <button
    class="btn btn-sm btn-ghost"
    onclick={() => {
      api.togglePanel(window.innerHeight/3)
    }}
  >
    <Icon icon={api.isPanelCollapsed ? "lucide:chevron-up" : "lucide:chevron-down"} />
  </button>
</div>

<style>
  .tab-with-badge {
    @apply flex gap-2 items-center;
  }
  .panel-tabs {
    @apply uppercase;
    .tab:not(.tab-active) {
      --tab-color: oklch(var(--bc) / 0.5);
    }
  }
</style>
