<script lang="ts">
  import Icon from "@iconify/svelte";
  
  import { Label, useTranslations } from '@/i18n';

  import { getEditorContext } from './context.svelte';
  import type { ProcessStatus } from './process';

  interface Props {
    onClick: () => void;
    status: ProcessStatus
  }
  const { onClick, status }: Props = $props();

  const ctx = getEditorContext()
  const t = useTranslations(ctx.lang)
</script>

<button class="btn btn-sm btn-primary" onclick={onClick}>
  {#if status === 'running'}
    <span class="loading loading-spinner"></span>
    {t(Label.EditorStopButton)}
  {:else if status === 'stopping'}
    <span class="loading loading-spinner"></span>
    {t(Label.EditorForceStopButton)}
  {:else}
    <Icon class="w-6" icon="lucide:play" />
    {t(Label.EditorRunButton)}
  {/if}
</button>
