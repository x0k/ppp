<script lang="ts">
  import Icon from "@iconify/svelte";

  import * as m from '@/paraglide/messages'
  
  import type { ProcessStatus } from './process';

  interface Props {
    onClick: () => void;
    status: ProcessStatus
  }
  const { onClick, status }: Props = $props();
</script>

<button class="btn btn-sm btn-primary" onclick={onClick}>
  {#if status === 'running'}
    <span class="loading loading-spinner"></span>
    {m.stop()}
  {:else if status === 'stopping'}
    <span class="loading loading-spinner"></span>
    {m.forceStop()}
  {:else}
    <Icon class="w-6" icon="lucide:play" />
    {m.run()}
  {/if}
</button>
