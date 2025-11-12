<script lang="ts">
  import LucidePlay from '~icons/lucide/play';

  import * as m from '$lib/paraglide/messages'
  
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
    {m.force_stop()}
  {:else}
    <LucidePlay class="w-6" />
    {m.run()}
  {/if}
</button>
