<script lang="ts">
  import { Language, type TestRunnerFactory } from '@/lib/testing';

  import Editor from '@/components/editor/editor.svelte';

  import { testsData, type Input, type Output } from './tests-data'
  import { testRunnerFactory as phpTestRunnerFactory } from './php/test-runners'
  import { jsTestRunnerFactory, tsTestRunnerFactory } from './js/test-runners'
  import { testRunnerFactory as pyTestRunnerFactory } from './python/test-runners'

  import phpInitialValue from './php/code.php?raw'
  import tsInitialValue from './js/code.ts?raw'
  import jsInitialValue from './js/code.js?raw'
  import pyInitialValue from './python/code.py?raw'

  const INITIAL_VALUES: Record<Language, string> = {
    [Language.PHP]: phpInitialValue,
    [Language.TypeScript]: tsInitialValue,
    [Language.JavaScript]: jsInitialValue,
    [Language.Python]: pyInitialValue,
  }

  const TEST_RUNNER_FACTORIES: Record<Language, TestRunnerFactory<Input, Output>> = {
    [Language.PHP]: phpTestRunnerFactory,
    [Language.TypeScript]: tsTestRunnerFactory,
    [Language.JavaScript]: jsTestRunnerFactory,
    [Language.Python]: pyTestRunnerFactory,
  }
</script>

<Editor
  contentId="design-patterns-factory"
  {testsData}
  initialValues={INITIAL_VALUES}
  testRunnerFactories={TEST_RUNNER_FACTORIES}
/>
