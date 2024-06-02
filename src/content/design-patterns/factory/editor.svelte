<script lang="ts">
  import { Language, RUNNER_LANGUAGES, Runner } from '@/lib/testing';
  
  import Editor from '@/components/editor.svelte';
  import EditorTestingPanel, { type TestCasesStates } from '@/components/editor-testing-panel.svelte';

  import { testCases, CaseType, type Inputs, type Outputs, CASE_TYPES } from './test-cases'
  import { testRunnerFactories as phpTestRunnerFactories } from './php/test-runners'
  import code from './php/code.php?raw';
  
  const defaultRunner = Runner.PhpWasm

  const INITIAL_VALUES: Record<Language, string> = {
    [Language.PHP]: code,
  }

  const CASES_FACTORIES: Record<Runner, () => TestCasesStates<CaseType, Inputs, Outputs>> = {
    [Runner.PhpWasm]: () => CASE_TYPES.map(id => ({
      id,
      isRunning: false,
      lastTestId: -1,
      testCase: testCases[id],
      testRunner: phpTestRunnerFactories[id],
    })) as TestCasesStates<CaseType, Inputs, Outputs>,
  }
</script>

<Editor
  {defaultRunner}
  initialValue={INITIAL_VALUES[RUNNER_LANGUAGES[defaultRunner]]}
  runners={[Runner.PhpWasm]}
  onLanguageChange={(lang, model) => {
    model.setValue(INITIAL_VALUES[lang])
  }}
>
  {#snippet children(runner, model)}
    <EditorTestingPanel {model} cases={CASES_FACTORIES[runner]()} />
  {/snippet}
</Editor>
