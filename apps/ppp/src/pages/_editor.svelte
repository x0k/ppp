<script lang="ts">
  import Editor, { type Runtime } from '@/containers/editor.svelte'
  import EditorPanel from '@/containers/editor-panel.svelte';
  import { Language } from '@/shared/languages';

  const runtimes: Record<Language, Runtime> = {
    [Language.PHP]: { initialValue: "", },
    [Language.TypeScript]: { initialValue: "", },
    [Language.Python]: { initialValue: "", },
    [Language.JavaScript]: { initialValue: "", },
    [Language.Go]: { initialValue: "", },
    [Language.Rust]: { initialValue: "", },
    [Language.Gleam]: { initialValue: "", },
    [Language.CSharp]: { initialValue: "", },
    [Language.Java]: { initialValue: "", },
  }
</script>

<div class="h-screen flex flex-col">
  <Editor {runtimes}>
    {#snippet panel(lang)}
      <EditorPanel maxHeight={window.innerHeight}>
        Panel
      </EditorPanel>
    {/snippet}
  </Editor>
</div>
