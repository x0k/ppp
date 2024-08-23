<script lang="ts">
  import type { Snippet } from 'svelte';

  import { Tab, TAB_TITLES } from './model';

  interface Props {
    testsCount: number;
    lastTestId: number;
    selectedTab: Tab | null;
    prepend?: Snippet;
    append?: Snippet;
  }

  let {
    selectedTab = $bindable(),
    testsCount,
    lastTestId,
    prepend,
    append,
  }: Props = $props();

  interface TabButtonProps { tab: Tab, append?: Snippet }
</script>

<div class="flex flex-wrap items-center gap-3 p-1">
  {#if prepend}
    {@render prepend()}
  {/if}
  <div role="tablist" class="tabs panel-tabs">
    {#snippet tabButton({ tab, append }: TabButtonProps)}
      <!-- svelte-ignore a11y_interactive_supports_focus -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_missing_attribute -->
      <span
        role="tab"
        class="tab"
        class:tab-with-badge={append}
        class:tab-active={selectedTab === tab}
        onclick={() => {
          if (selectedTab === tab) {
            selectedTab = null
          } else {
            selectedTab = tab
          }
        }}
      >
        {TAB_TITLES[tab]}
        {#if append}
          {@render append()}
        {/if}
      </span>
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
  <div class="grow"></div>
  {#if append}
    {@render append()}
  {/if}
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
