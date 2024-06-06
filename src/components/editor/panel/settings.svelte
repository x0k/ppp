<script lang="ts">
  import { vimState } from "../model";
</script>

<div class="grow overflow-auto">
  <div class="flex flex-col gap-4 p-4">
    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">Vim mode</span>
        <input type="checkbox" bind:checked={vimState.value} class="checkbox" />
      </label>
    </div>
  </div>
</div>
