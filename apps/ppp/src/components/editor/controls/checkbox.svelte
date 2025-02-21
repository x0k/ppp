<script lang="ts">
  interface Props {
    title: string;
    value: boolean;
  }

  let { value = $bindable(), title }: Props = $props();
</script>

<label class="fieldset-label">
  <input type="checkbox" bind:checked={value} class="checkbox" />
  {title}
</label>
