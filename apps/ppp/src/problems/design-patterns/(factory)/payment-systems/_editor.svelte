<script lang="ts">
  import type { Snippet } from "svelte";

  import { Language } from "@/shared/languages";
  import type { Lang } from "@/i18n";
  import JsDescription from "@/adapters/runtime/js/description.svelte";
  import Editor from "@/containers/test-editor.svelte";

  import { testCases } from "./tests-data";
  import { jsCode, jsFactory } from "./js";
  // import { tsCode, tsFactory } from "./ts";
  // import { phpCode, phpFactory } from "./php";
  // import { pyCode, pyFactory } from "./python";
  // import { goCode, goFactory } from "./go";
  // import { rustCode, rustFactory } from "./rust";
  // import { gleamCode, gleamFactory } from "./gleam";
  // import { csCode, csFactory } from "./csharp";
  // import { javaCode, javaFactory } from "./java";

  interface Props {
    pageLang: Lang;
    children: Snippet;
  }

  const { pageLang, children }: Props = $props();
</script>

<Editor
  contentId={location.pathname}
  {pageLang}
  {children}
  {testCases}
  runtimes={{
    [Language.JavaScript]: {
      initialValue: jsCode,
      testCompilerFactory: jsFactory,
      Description: JsDescription,
    },
  }}
/>
