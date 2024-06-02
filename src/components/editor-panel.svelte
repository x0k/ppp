<script lang="ts">
  import type { editor } from "monaco-editor";
  import Icon from "@iconify/svelte";

  import { runTest } from "@/lib/testing";
  import {
    CaseType,
    testCases,
  } from "@/content/design-patterns/factory/test-cases";
  import { testRunnerFactories } from "@/content/design-patterns/factory/php/test-runners";

  let { model }: { model: editor.IModel } = $props();

  const cases = $state(
    Object.entries(testCases).map(([id, testCase]) => ({
      ...testCase,
      id,
      isRunning: false,
      lastTestId: -1,
      testRunner: testRunnerFactories[id as CaseType],
    }))
  );

  let isRunning = $derived(cases.some((c) => c.isRunning));

  async function runTestCase(testCase: (typeof cases)[number]) {
    if (testCase.isRunning) {
      return;
    }
    testCase.isRunning = true;
    const t = await testCase.testRunner(model.getValue());
    try {
      testCase.lastTestId = await runTest(t, testCase.data as any);
    } finally {
      t[Symbol.dispose]();
      testCase.isRunning = false;
    }
  }
</script>

<button
  class="btn btn-sm btn-primary"
  onclick={async () => {
    if (isRunning) {
      return;
    }
    for (const testCase of cases) {
      await runTestCase(testCase);
    }
  }}
>
  {#if isRunning}
    <span class="loading loading-spinner"></span>
  {:else}
    <Icon class="w-6" icon="lucide:play" />
  {/if}
</button>
{#each cases as testCase (testCase.id)}
  <button
    class="btn btn-sm btn-secondary"
    class:btn-success={testCase.lastTestId === testCase.data.length}
    class:btn-error={testCase.lastTestId < testCase.data.length &&
      testCase.lastTestId >= 0}
    onclick={() => {
      runTestCase(testCase);
    }}
  >
    {testCase.name}
    {#if testCase.isRunning}
      <span class="loading loading-spinner"></span>
    {:else}
      <span class="w-6 text-center"
        >{Math.max(testCase.lastTestId, 0)}/{testCase.data.length}</span
      >
    {/if}
  </button>
{/each}
