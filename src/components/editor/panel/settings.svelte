<script lang="ts">
  import { testRunnerTimeout, vimState } from "../model";
</script>

<div class="grow overflow-auto">
  <div class="flex flex-col gap-4 p-4">
    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">Vim mode</span>
        <input type="checkbox" bind:checked={vimState.value} class="checkbox" />
      </label>
    </div>
    <label class="form-control">
      <div class="label">
        <span class="label-text">Test runner timeout (ms)</span>
        <span class="label-text-alt">Use zero to disable</span>
      </div>
      <input
        type="number"
        class="input input-bordered"
        class:input-error={testRunnerTimeout.value < 0}
        bind:value={testRunnerTimeout.value}
        min="0"
      />
    </label>
  </div>
</div>
