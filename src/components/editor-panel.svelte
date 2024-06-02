<script lang="ts" context="module">
  export type UiTestCase2<T extends string, I, O> = TestCase<I, O> & {
    id: T;
    isRunning: boolean;
    lastTestId: number;
    testRunner: TestRunnerFactory<I, O>;
  };
</script>

<script
  lang="ts"
  generics="Key extends string, Inputs extends Record<Key, unknown>, Outputs extends Record<Key, unknown>"
>
  import type { editor } from "monaco-editor";
  import Icon from "@iconify/svelte";

  import {
    runTest,
    type TestCase,
    type TestRunnerFactory,
  } from "@/lib/testing";

  interface Props<
    T extends string,
    Inputs extends Record<T, unknown>,
    Outputs extends Record<T, unknown>,
  > {
    model: editor.IModel;
    cases: {
      [k in T]: UiTestCase2<k, Inputs[k], Outputs[k]>;
    }[T][];
  }

  let { model, cases: initialCases }: Props<Key, Inputs, Outputs> = $props();

  const cases = $state(initialCases);

  let isRunning = $derived(cases.some((c) => c.isRunning));

  async function runTestCase<T extends string, I, O>(
    testCase: UiTestCase2<T, I, O>
  ) {
    if (testCase.isRunning) {
      return;
    }
    testCase.isRunning = true;
    const t = await testCase.testRunner(model.getValue());
    try {
      testCase.lastTestId = await runTest(t, testCase.data);
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
