<script lang="ts">
	import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    alt?: string;
    value: string
    options: string[];
    label?: Snippet<[string]>;
  }

  let { value = $bindable(), options, label, title, alt }: Props = $props()
</script>

<fieldset class="fieldset">
  <legend class="fieldset-legend">{title}</legend>
  <select class="select" bind:value>
    {#each options as option (option)}
      <option value={option}>
        {#if label}
          {@render label(option)}
        {:else}
          {option}
        {/if}
      </option>
    {/each}
  </select>
  {#if alt}
    <span class="label">{alt}</span>
  {/if}
</fieldset>
