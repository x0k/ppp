<script lang="ts">
  import { editor } from "monaco-editor";

  import code from "@/example/code.php?raw";

  const model = editor.createModel(code, "php");

  let codeEditorElement: HTMLDivElement;

  $effect(() => {
    editor.create(codeEditorElement, {
      model: model,
      theme: "vs-dark",
      language: "php",
      automaticLayout: true,
    });
  });

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

<div bind:this={codeEditorElement} class="grow"></div>
<div class="p-4 border-t border-base-100 flex items-center gap-3">
  <button class="btn btn-sm btn-primary"> Run </button>
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
  <select class="select select-ghost select-sm ml-auto">
    <option> PHP 8.2.11 </option>
  </select>
</div>
