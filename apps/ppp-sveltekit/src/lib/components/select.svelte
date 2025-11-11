<script lang="ts" generics="T extends string" >
  interface Props {
    value: T
    options: T[]
    labels?: Record<T, string>
    class?: string
  }

  let { value = $bindable(), options, class: className, labels }: Props = $props();
</script>

<select class={["select", className]} bind:value>
  {#each options as option (option)}
    <option value={option}>{labels?.[option] ?? option}</option>
  {/each}
</select>
