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
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer hendrerit lacinia nulla id euismod. Vestibulum ac dignissim libero, nec vehicula est. Phasellus rhoncus urna dolor, nec auctor odio tempus eu. Proin dapibus erat magna, eget dapibus urna sagittis vel. Morbi blandit in erat eget ullamcorper. Cras elementum imperdiet ipsum a maximus. Donec tempus lectus imperdiet ligula facilisis bibendum. Cras nulla erat, cursus sit amet efficitur eget, posuere in nibh. Suspendisse eu condimentum dolor. Fusce fermentum fermentum ex, ac aliquam lacus interdum a. Integer nisl ex, dapibus vitae orci et, tempus porttitor enim. Aliquam vitae urna in ante pharetra semper. Fusce vel tellus sit amet quam cursus dignissim a ut est.

    Aliquam nec augue est. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras blandit lacus eget urna cursus porta. Praesent nibh turpis, dapibus in tristique facilisis, suscipit eu tortor. Pellentesque volutpat magna ac tellus consequat, non tempus felis laoreet. Donec at odio pulvinar, volutpat risus vitae, porttitor ligula. Sed varius quam id mi convallis, in molestie sapien placerat. Curabitur euismod vulputate dolor non viverra. Aenean massa enim, pretium ac velit quis, iaculis pharetra massa. Nulla imperdiet, felis vitae sagittis elementum, sapien libero tempor metus, id luctus est eros ac metus. Maecenas ornare quam sed tortor feugiat, vitae iaculis libero facilisis.
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
