import { mount } from "svelte";

import type { TestData, TestRunnerFactory } from "testing";

import Editor, { type Props } from "@/components/editor/editor.svelte";
import type { Language } from "@/lib/languages";

export function mountEditor<L extends Language, I, O>(
  testsData: TestData<I, O>[],
  runtimes: Record<
    L,
    { initialValue: string; testRunnerFactory: TestRunnerFactory<I, O> }
  >
) {
  const element = document.getElementById("editor-placeholder")!;
  const props = {
    contentId: element.dataset.contentId!,
    testsData,
    runtimes,
  } satisfies Props<L, I, O>;
  mount(Editor, {
    target: element.parentElement!,
    // @ts-expect-error svelte types are wrong
    props,
  });
}
