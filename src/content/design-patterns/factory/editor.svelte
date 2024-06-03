<script lang="ts">
  import { Language } from '@/lib/testing';
  
  import Editor from '@/components/editor.svelte';
  import EditorTestingPanel, { type TestCasesStates } from '@/components/editor-testing-panel.svelte';

  import { testCases, CaseType, type Inputs, type Outputs, CASE_TYPES } from './test-cases'
  import { testRunnerFactories as phpTestRunnerFactories } from './php/test-runners'
  import { tsTestRunnerFactories, jsTestRunnerFactories } from './js/test-runners'
  import { testRunnerFactories as pyTestRunnerFactories } from './python/test-runners'

  const INITIAL_VALUES: Record<Language, Promise<string>> = {
    [Language.PHP]: import('./php/code.php?raw').then(m => m.default),
    [Language.TypeScript]: import('./js/code.ts?raw').then(m => m.default),
    [Language.JavaScript]: import('./js/code.js?raw').then(m => m.default),
    [Language.Python]: import('./python/code.py?raw').then(m => m.default),
  }

  const CASES_FACTORIES: Record<Language, () => TestCasesStates<CaseType, Inputs, Outputs>> = {
    [Language.PHP]: () => CASE_TYPES.map(id => ({
      id,
      isRunning: false,
      lastTestId: -1,
      testCase: testCases[id],
      testRunner: phpTestRunnerFactories[id],
    })) as TestCasesStates<CaseType, Inputs, Outputs>,
    [Language.TypeScript]: () => CASE_TYPES.map(id => ({
      id,
      isRunning: false,
      lastTestId: -1,
      testCase: testCases[id],
      testRunner: tsTestRunnerFactories[id],
    })) as TestCasesStates<CaseType, Inputs, Outputs>,
    [Language.JavaScript]: () => CASE_TYPES.map(id => ({
      id,
      isRunning: false,
      lastTestId: -1,
      testCase: testCases[id],
      testRunner: jsTestRunnerFactories[id],
    })) as TestCasesStates<CaseType, Inputs, Outputs>,
    [Language.Python]: () => CASE_TYPES.map(id => ({
      id,
      isRunning: false,
      lastTestId: -1,
      testCase: testCases[id],
      testRunner: pyTestRunnerFactories[id],
    })) as TestCasesStates<CaseType, Inputs, Outputs>,
  }
  const defaultLanguage = Language.PHP;
</script>

<Editor
  {defaultLanguage}
  languages={Object.keys(CASES_FACTORIES) as Language[]}
  onLanguageChange={async (lang, model) => {
    model.setValue(await INITIAL_VALUES[lang])
  }}
>
  {#snippet children(lang, model)}
    <EditorTestingPanel {model} cases={CASES_FACTORIES[lang]()} />
  {/snippet}
</Editor>
