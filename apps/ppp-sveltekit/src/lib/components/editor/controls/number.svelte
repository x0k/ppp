<script lang="ts">
  interface Props {
    value: number;
    title: string;
    alt?: string;
  }

  let { value = $bindable(), title, alt }: Props = $props();
</script>

<fieldset class="fieldset">
  <legend class="fieldset-legend">{title}</legend>
  <input type="number" class="input" bind:value />
  {#if alt}
    <p class="fieldset-label">{alt}</p>
  {/if}
</fieldset>
