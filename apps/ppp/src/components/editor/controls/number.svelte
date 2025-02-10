<script lang="ts">
  interface Props {
    value: number;
    title: string;
    alt?: string;
  }

  let { value = $bindable(), title, alt }: Props = $props();
</script>

<label class="form-control">
  <div class="label">
    <span class="label-text">{title}</span>
    {#if alt}
      <span class="label-text-alt">{alt}</span>
    {/if}
  </div>
  <input type="number" class="input input-bordered" bind:value />
</label>
