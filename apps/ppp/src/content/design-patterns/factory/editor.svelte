<script lang="ts">
  import { type TestRunnerFactory } from "testing";

  import { Language } from "@/lib/languages";
  import { makeRemoteTestRunnerFactory } from "@/adapters/testing-actor";
  import Editor from "@/components/editor/editor.svelte";

  import { testsData, type Input, type Output } from "./tests-data";

  import { jsCode, JsWorker } from "./js";
  import { tsCode, TsWorker } from "./ts";
  import { phpCode, PhpWorker } from "./php";
  import { pyCode, PyWorker } from "./python";

  const INITIAL_VALUES: Record<Language, string> = {
    [Language.PHP]: phpCode,
    [Language.TypeScript]: tsCode,
    [Language.JavaScript]: jsCode,
    [Language.Python]: pyCode,
  };

  const TEST_RUNNER_FACTORIES: Record<
    Language,
    TestRunnerFactory<Input, Output>
  > = {
    [Language.PHP]: makeRemoteTestRunnerFactory(PhpWorker),
    [Language.TypeScript]: makeRemoteTestRunnerFactory(TsWorker),
    [Language.JavaScript]: makeRemoteTestRunnerFactory(JsWorker),
    [Language.Python]: makeRemoteTestRunnerFactory(PyWorker),
  };
</script>

<Editor
  contentId="design-patterns-factory"
  {testsData}
  initialValues={INITIAL_VALUES}
  testRunnerFactories={TEST_RUNNER_FACTORIES}
/>
