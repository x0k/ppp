<script lang="ts" context="module">
  import type { TestCase, TestRunnerFactory } from "@/lib/testing/testing";

  export interface TestCaseState<T extends string, I, O> {
    id: T;
    isRunning: boolean;
    lastTestId: number;
    testCase: TestCase<I, O>;
    testRunner: TestRunnerFactory<I, O>;
  }

  export type TestCasesStates<
    T extends string,
    Inputs extends Record<T, unknown>,
    Outputs extends Record<T, unknown>,
  > = {
    [k in T]: TestCaseState<k, Inputs[k], Outputs[k]>;
  }[T][];
</script>

<script
  lang="ts"
  generics="Key extends string, Inputs extends Record<Key, unknown>, Outputs extends Record<Key, unknown>"
>
  import type { editor } from "monaco-editor";
  import Icon from "@iconify/svelte";

  import { runTest } from "@/lib/testing";

  interface Props<
    T extends string,
    Inputs extends Record<T, unknown>,
    Outputs extends Record<T, unknown>,
  > {
    model: editor.IModel;
    cases: TestCasesStates<T, Inputs, Outputs>;
  }

  let { model, cases: initialData }: Props<Key, Inputs, Outputs> = $props();

  const states = $state(initialData);

  let isRunning = $derived(states.some((c) => c.isRunning));

  async function execTestCase<T extends string, I, O>(
    state: TestCaseState<T, I, O>
  ) {
    if (state.isRunning) {
      return;
    }
    state.isRunning = true;
    const runner = await state.testRunner(model.getValue());
    try {
      state.lastTestId = await runTest(runner, state.testCase.data);
    } finally {
      runner[Symbol.dispose]();
      state.isRunning = false;
    }
  }
</script>

<button
  class="btn btn-sm btn-primary"
  onclick={async () => {
    if (isRunning) {
      return;
    }
    for (const state of states) {
      await execTestCase(state);
    }
  }}
>
  {#if isRunning}
    <span class="loading loading-spinner"></span>
  {:else}
    <Icon class="w-6" icon="lucide:play" />
  {/if}
</button>
{#each states as state (state.id)}
  <button
    class="btn btn-sm btn-secondary"
    class:btn-success={state.lastTestId === state.testCase.data.length}
    class:btn-error={state.lastTestId < state.testCase.data.length &&
      state.lastTestId >= 0}
    onclick={() => {
      execTestCase(state);
    }}
  >
    {state.testCase.name}
    {#if state.isRunning}
      <span class="loading loading-spinner"></span>
    {:else}
      <span class="w-6 text-center"
        >{Math.max(state.lastTestId, 0)}/{state.testCase.data.length}</span
      >
    {/if}
  </button>
{/each}
