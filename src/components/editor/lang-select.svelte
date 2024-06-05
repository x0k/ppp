<script lang="ts" generics="Lang extends Language">
  import { LANGUAGE_TITLE, type Language } from "@/lib/testing";

  interface Props<L extends Language> {
    lang: L;
    languages: L[];
  }

  let { lang = $bindable(), languages }: Props<Lang> = $props();
</script>

<select class="select select-ghost select-sm" bind:value={lang}>
  {#each languages as lang (lang)}
    <option value={lang}>{LANGUAGE_TITLE[lang]}</option>
  {/each}
</select>
