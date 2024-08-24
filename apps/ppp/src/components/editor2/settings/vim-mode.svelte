<script lang="ts">
  import { Label, useTranslations } from "@/i18n";

  import { getEditorContext } from "../context.svelte";

  const editorCtx = getEditorContext();
  const t = useTranslations(editorCtx.lang);

  interface Props {
    vimState: boolean;
  }

  let { vimState = $bindable() }: Props = $props();
</script>

<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">{t(Label.EditorSettingsVimMode)}</span>
    <input type="checkbox" bind:checked={vimState} class="checkbox" />
  </label>
</div>
