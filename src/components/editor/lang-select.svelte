<script lang="ts">
  import { LANGUAGE_TITLE, type Language } from "@/lib/testing";

  interface Props {
    lang: Language;
    languages: Language[];
  }

  let { lang = $bindable(), languages }: Props = $props();
</script>

<select class="select select-ghost select-sm ml-auto" bind:value={lang}>
  {#each languages as lang (lang)}
    <option value={lang}>{LANGUAGE_TITLE[lang]}</option>
  {/each}
</select>
