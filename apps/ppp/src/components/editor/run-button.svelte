<script lang="ts">
  import Icon from "@iconify/svelte";
  
  import { Label, useTranslations } from '@/i18n';

  import { getEditorContext } from './context.svelte';

  interface Props {
    onClick: () => void;
    isRunning: boolean;
  }
  const { onClick, isRunning }: Props = $props();

  const ctx = getEditorContext()
  const t = useTranslations(ctx.lang)
</script>

<button class="btn btn-sm btn-primary" onclick={onClick}>
  {#if isRunning}
    <span class="loading loading-spinner"></span>
    {t(Label.EditorStopButton)}
  {:else}
    <Icon class="w-6" icon="lucide:play" />
    {t(Label.EditorRunButton)}
  {/if}
</button>
