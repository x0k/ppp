<script lang="ts" generics="Input, Output">
  import type { Snippet } from 'svelte';
  import type { editor } from "monaco-editor";
  import Icon from "@iconify/svelte";

  import {
    runTest,
    type TestData,
    type TestRunnerFactory,
  } from "@/lib/testing";

  interface Props<I, O> {
    model: editor.IModel;
    testsData: TestData<I, O>[];
    testRunnerFactory: TestRunnerFactory<I, O>;
    children: Snippet
  }

  let { model, testsData, testRunnerFactory, children }: Props<Input, Output> = $props();

  let isRunning = $state(false);
  let lastTestId = $state(-1);

  $effect(() => {
    testsData;
    testRunnerFactory;
    isRunning = false;
    lastTestId = -1;
  });
</script>


<div class="border-t border-base-100 relative flex flex-col bg-base-300 overflow-hidden">
  <div class="flex items-center gap-3">
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
      <span role="tab" class="tab tab-active flex gap-2">
        Tests
        <div
          class="badge"
          class:hidden={lastTestId < 0}
          class:badge-success={lastTestId === testsData.length}
          class:badge-error={lastTestId < testsData.length && lastTestId >= 0}
        >
          {lastTestId}/{testsData.length}
        </div>
      </span>
      <span role="tab" class="tab">Output</span>
      <span role="tab" class="tab">Settings</span>
    </div>
    {@render children()}
  </div>
  <div class="min-h-0 min-w-0 overflow-auto">
    <div class="flex flex-col gap-4 p-6">
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
</div>

<style>
  .panel-tabs {
    @apply uppercase;
    .tab:not(.tab-active) {
      --tab-color: oklch(var(--bc) / 0.5);
    }
  }
</style>
