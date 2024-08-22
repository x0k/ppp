import { mount } from "svelte";

import type { TestCase, TestCompilerFactory } from "testing";

import { Language } from "@/shared/languages";
import Editor, {
  type Props,
  type Runtime,
} from "@/components/editor/editor.svelte";
import { DESCRIPTIONS } from "@/adapters/runtime/descriptions";

export function mountEditor<L extends Language, I, O>(
  testCases: TestCase<I, O>[],
  runtimes: Record<
    L,
    { initialValue: string; factory: TestCompilerFactory<I, O> }
  >
) {
  const element = document.getElementById("editor-placeholder");
  if (!element) {
    return;
    // throw new Error("No editor placeholder found");
  }
  const props = {
    contentId: location.pathname,
    testCases,
    runtimes: Object.fromEntries(
      Object.keys(runtimes).map(
        (lang) =>
          [
            lang,
            {
              initialValue: runtimes[lang as L].initialValue,
              testRunnerFactory: runtimes[lang as L].factory,
              Description: DESCRIPTIONS[lang as L],
            } satisfies Runtime<I, O>,
          ] as const
      )
    ) as Record<L, Runtime<I, O>>,
  } satisfies Props<L, I, O>;
  mount(Editor, {
    target: element.parentElement!,
    // @ts-expect-error svelte types are wrong
    props,
  });
}
