<script lang="ts">
  import { Label, useTranslations } from "@/i18n";

  import { getEditorContext } from "../context.svelte";

  const ctx = getEditorContext();
  const t = useTranslations(ctx.lang);

  interface Props {
    title: Label;
    value: boolean;
  }

  let { value = $bindable(), title }: Props = $props();
</script>

<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">{t(title)}</span>
    <input type="checkbox" bind:checked={value} class="checkbox" />
  </label>
</div>
