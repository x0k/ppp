<script lang="ts">
  import type { Snippet } from "svelte";

  import { Language } from "$lib/language";
  import { ProblemCategory } from '$lib/problem';
  import { TestEditor } from "$lib/test-editor";

  import { testCases } from "./tests-data";
  import { jsCode, jsFactory } from "./js";
  import { tsCode, tsFactory } from "./ts";
  import { phpCode, phpFactory } from "./php";
  import { pyCode, pyFactory } from "./python";
  import { goCode, goFactory } from "./go";
  import { rustCode, rustFactory } from "./rust";
  import { gleamCode, gleamFactory } from "./gleam";
  import { csCode, csFactory } from "./csharp";
  import { javaCode, javaFactory } from "./java";
  import { rubyCode, rubyFactory } from './ruby'

</script>

<TestEditor
  contentId={location.pathname}
  problemCategory={ProblemCategory.DesignPatterns}
  {testCases}
  runtimes={{
    [Language.JavaScript]: {
      initialValue: jsCode,
      testCompilerFactory: jsFactory,
    },
    [Language.TypeScript]: {
      initialValue: tsCode,
      testCompilerFactory: tsFactory,
    },
    [Language.PHP]: {
      initialValue: phpCode,
      testCompilerFactory: phpFactory,
    },
    [Language.Python]: {
      initialValue: pyCode,
      testCompilerFactory: pyFactory,
    },
    [Language.Go]: {
      initialValue: goCode,
      testCompilerFactory: goFactory,
    },
    [Language.Rust]: {
      initialValue: rustCode,
      testCompilerFactory: rustFactory,
    },
    [Language.Gleam]: {
      initialValue: gleamCode,
      testCompilerFactory: gleamFactory,
    },
    [Language.CSharp]: {
      initialValue: csCode,
      testCompilerFactory: csFactory,
    },
    [Language.Java]: {
      initialValue: javaCode,
      testCompilerFactory: javaFactory,
    },
    [Language.Ruby]: {
      initialValue: rubyCode,
      testCompilerFactory: rubyFactory,
    },
  }}
>
  Content
</TestEditor>
