<script lang="ts" generics="Input, Output">
  import Icon from "@iconify/svelte";

  import type { TestCase } from "libs/testing";

  interface Props<I, O> {
    testsData: TestCase<I, O>[];
    lastTestId: number;
  }

  const { testsData: testCases, lastTestId }: Props<Input, Output> = $props();
</script>

<div class="overflow-auto flex flex-col gap-4 p-4">
  {#each testCases as testCase, i}
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
      <pre class="p-2 rounded bg-base-100"><code
          >{JSON.stringify(testCase.input, null, 2)}</code
        ></pre>
    </div>
  {/each}
</div>
