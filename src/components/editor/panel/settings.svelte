<script lang="ts">
  import Icon from "@iconify/svelte";

  import { vimState, type SurfaceApi } from "../model";

  interface Props {
    resetEditorContent: () => void;
    api: SurfaceApi;
  }

  let { resetEditorContent, api }: Props = $props();
</script>

<div class="grow overflow-auto">
  <div class="flex flex-col gap-4 p-4">
    <button
      class="btn btn-error"
      onclick={() => {
        resetEditorContent();
        api.editor?.focus();
      }}
    >
      <Icon class="w-6" icon="lucide:rotate-ccw" />
      Reset editor content
    </button>
    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">Vim mode</span>
        <input type="checkbox" bind:checked={vimState.value} class="checkbox" />
      </label>
    </div>
  </div>
</div>
