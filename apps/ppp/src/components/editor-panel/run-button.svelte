<script lang="ts">
  import Icon from "@iconify/svelte";

  interface Props {
    onRun: () => void;
    isRunning: boolean;
  }
  const { onRun, isRunning }: Props = $props();
</script>

<button class="btn btn-sm btn-primary" onclick={onRun}>
  {#if isRunning}
    <span class="loading loading-spinner"></span>
    Stop
  {:else}
    <Icon class="w-6" icon="lucide:play" />
    Run
  {/if}
</button>
