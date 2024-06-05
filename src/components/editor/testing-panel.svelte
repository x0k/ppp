<script lang="ts" generics="Input, Output">
  import type { Snippet } from 'svelte';
  import type { editor } from "monaco-editor";
  import Icon from "@iconify/svelte";

  import {
    runTest,
    type TestData,
    type TestRunnerFactory,
  } from "@/lib/testing";
  
  import type { SurfaceApi } from './model';

  interface Props<I, O> {
    api: SurfaceApi
    model: editor.IModel;
    testsData: TestData<I, O>[];
    testRunnerFactory: TestRunnerFactory<I, O>;
    children: Snippet
    header: Snippet
  }

  let { api, model, testsData, testRunnerFactory, children, header }: Props<Input, Output> = $props();

  let isRunning = $state(false);
  let lastTestId = $state(-1);

  $effect(() => {
    testsData;
    testRunnerFactory;
    isRunning = false;
    lastTestId = -1;
  });

  enum Tab {
    Tests = "tests",
    Output = "output",
    Settings = "settings",
  }

  const TAB_TITLES: Record<Tab, string> = {
    [Tab.Tests]: "Tests",
    [Tab.Output]: "Output",
    [Tab.Settings]: "Settings",
  };

  let selectedTab = $state<Tab>(Tab.Tests)

  interface TabButtonProps { tab: Tab, append?: Snippet }
</script>

<div class="border-t border-base-100 relative flex flex-col bg-base-300 overflow-hidden">
  <div class="flex items-center gap-3 px-4">
    <button
      class="btn btn-sm btn-primary"
      onclick={async () => {
        if (isRunning) {
          return;
        }
        isRunning = true;
        const runner = await testRunnerFactory(model.getValue());
        try {
          lastTestId = await runTest(runner, testsData);
        } finally {
          runner[Symbol.dispose]();
          isRunning = false;
        }
      }}
    >
      {#if isRunning}
        <span class="loading loading-spinner"></span>
      {:else}
        <Icon class="w-6" icon="lucide:play" />
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
          class:badge-success={lastTestId === testsData.length}
          class:badge-error={lastTestId < testsData.length && lastTestId >= 0}
        >
          {lastTestId}/{testsData.length}
        </div>
      {/snippet}
      {@render tabButton({ tab: Tab.Tests, append: testBadge })}
      {@render tabButton({ tab: Tab.Output })}
      {@render tabButton({ tab: Tab.Settings })}
    </div>
    <div class="grow" ></div>
    {@render header()}
  </div>
  <div class="min-h-0 min-w-0 overflow-auto">
    <div class="flex flex-col gap-4 p-4">
      {#each testsData as testData, i}
        <div>
          <div class="flex items-center gap-2 pb-2">
            {#if lastTestId === i}
              <Icon icon="lucide:circle-x" class="text-error" />
            {:else if i < lastTestId}
              <Icon icon="lucide:circle-check" class="text-success" />
            {:else}
              <Icon icon="lucide:circle-dashed" />
            {/if}
            Case {i + 1}
          </div>
          <pre
            class="p-2 rounded bg-base-100"
          ><code>{JSON.stringify(testData.input, null, 2)}</code></pre>
        </div>
      {/each}
    </div>
  </div>
  {@render children()}
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
