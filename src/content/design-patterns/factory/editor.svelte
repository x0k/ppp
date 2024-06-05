<script lang="ts">
  import { Language, type TestRunnerFactory } from '@/lib/testing';

  import Editor from '@/components/editor/editor.svelte';

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
</script>

<Editor
  testData={testsData}
  testRunnerFactories={TEST_RUNNER_FACTORIES}
  onLanguageChange={async (lang, model) => {
    model.setValue(await INITIAL_VALUES[lang])
  }}
/>
