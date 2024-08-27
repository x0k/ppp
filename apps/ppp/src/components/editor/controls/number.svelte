<script lang="ts">
  import { useTranslations, type Label } from "@/i18n";

  import { getEditorContext } from '../context.svelte';
  
  const ctx = getEditorContext();
  const t = useTranslations(ctx.lang);

  interface Props {
    value: number;
    title: Label;
    alt?: Label;
  }

  let { value = $bindable(), title, alt }: Props = $props();
</script>

<label class="form-control">
  <div class="label">
    <span class="label-text">{t(title)}</span>
    {#if alt}
      <span class="label-text-alt">{t(alt)}</span>
    {/if}
  </div>
  <input type="number" class="input input-bordered" bind:value />
</label>
