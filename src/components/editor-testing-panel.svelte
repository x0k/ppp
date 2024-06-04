<script lang="ts" generics="Input, Output">
  import type { editor } from "monaco-editor";
  import Icon from "@iconify/svelte";

  import {
    runTest,
    type TestData,
    type TestRunnerFactory,
  } from "@/lib/testing";

  interface Props<I, O> {
    model: editor.IModel;
    testData: TestData<I, O>[];
    testRunnerFactory: TestRunnerFactory<I, O>;
  }

  let { model, testData, testRunnerFactory }: Props<Input, Output> = $props();

  let isRunning = $state(false);
  let lastTestId = $state(-1);

  $effect(() => {
    testData;
    testRunnerFactory;
    isRunning = false;
    lastTestId = -1;
  });
</script>

<button
  class="btn btn-sm btn-primary"
  onclick={async () => {
    if (isRunning) {
      return;
    }
    isRunning = true;
    const runner = await testRunnerFactory(model.getValue());
    try {
      lastTestId = await runTest(runner, testData);
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
<div role="tablist" class="tabs uppercase">
  <span role="tab" class="tab flex gap-2 text-base-content/50">
    Tests
    <div
      class="badge"
      class:badge-success={lastTestId === testData.length}
      class:badge-error={lastTestId < testData.length && lastTestId >= 0}
    >
      {Math.max(lastTestId, 0)}/{testData.length}
    </div>
  </span>
  <span role="tab" class="tab tab-active">Output</span>
  <span role="tab" class="tab text-base-content/50">Settings</span>
</div>
