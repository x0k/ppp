<script lang="ts">
  import { WebPHP } from "@php-wasm/web";

  let { php }: { php: WebPHP } = $props();

  enum CaseStatus {
    Idle = "idle",
    Running = "running",
    Success = "success",
    Error = "error",
  }

  const cases = $state([
    {
      id: "1",
      name: "Case 1",
      status: CaseStatus.Idle,
    },
    {
      id: "2",
      name: "Case 2",
      status: CaseStatus.Idle,
    },
  ]);
</script>

<button class="btn btn-sm btn-primary"> Run All </button>
{#each cases as testCase (testCase.id)}
  <button
    class="btn btn-sm btn-secondary"
    class:btn-success={testCase.status === CaseStatus.Success}
    class:btn-error={testCase.status === CaseStatus.Error}
    onclick={async () => {
      if (testCase.status === CaseStatus.Running) {
        return;
      }
      testCase.status = CaseStatus.Running;
    }}
  >
    {testCase.name}
    {#if testCase.status === CaseStatus.Running}
      <span class="loading loading-spinner"></span>
    {/if}
  </button>
{/each}
