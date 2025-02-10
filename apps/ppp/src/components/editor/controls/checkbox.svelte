<script lang="ts">
  interface Props {
    title: string
    value: boolean;
  }

  let { value = $bindable(), title }: Props = $props();
</script>

<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">{title}</span>
    <input type="checkbox" bind:checked={value} class="checkbox" />
  </label>
</div>
