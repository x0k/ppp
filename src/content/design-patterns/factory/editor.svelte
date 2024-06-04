<script lang="ts">
  import { Language, type TestRunnerFactory } from '@/lib/testing';

  import { createSyncStorage } from '@/adapters/storage'
  import Editor from '@/components/editor.svelte';
  import EditorTestingPanel from '@/components/editor-testing-panel.svelte';


  import { testsData, type Input, type Output } from './tests-data'
  import { testRunnerFactory as phpTestRunnerFactory } from './php/test-runners'
  import { jsTestRunnerFactory, tsTestRunnerFactory } from './js/test-runners'
  import { testRunnerFactory as pyTestRunnerFactory } from './python/test-runners'

  const INITIAL_VALUES: Record<Language, Promise<string>> = {
    [Language.PHP]: import('./php/code.php?raw').then(m => m.default),
    [Language.TypeScript]: import('./js/code.ts?raw').then(m => m.default),
    [Language.JavaScript]: import('./js/code.js?raw').then(m => m.default),
    [Language.Python]: import('./python/code.py?raw').then(m => m.default),
  }

  const TEST_RUNNER_FACTORIES: Record<Language, TestRunnerFactory<Input, Output>> = {
    [Language.PHP]: phpTestRunnerFactory,
    [Language.TypeScript]: tsTestRunnerFactory,
    [Language.JavaScript]: jsTestRunnerFactory,
    [Language.Python]: pyTestRunnerFactory,
  }
  
  const widthStorage = createSyncStorage(localStorage, "editor-width", window.innerWidth - 800)
  const langStorage = createSyncStorage(localStorage, "editor-lang", Language.PHP)
  const defaultLanguage = $state(langStorage.load());
</script>

<Editor
  {defaultLanguage}
  {widthStorage}
  languages={Object.keys(TEST_RUNNER_FACTORIES) as Language[]}
  onLanguageChange={async (lang, model) => {
    model.setValue(await INITIAL_VALUES[lang])
    langStorage.save(lang)
  }}
>
  {#snippet children(lang, model)}
    <EditorTestingPanel {model} testData={testsData} testRunnerFactory={TEST_RUNNER_FACTORIES[lang]} />
  {/snippet}
</Editor>
