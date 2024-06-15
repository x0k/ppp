import { mount } from "svelte";

import type { TestData } from "testing";

import Editor from "@/components/editor/editor.svelte";

export function mountEditor<I, O>(
  testsData: TestData<I, O>[],
  runtimes: Record<string, { initialValue: string; testRunnerFactory: any }>
) {
  const element = document.getElementById("editor-placeholder")!;
  mount(Editor, {
    target: element.parentElement!,
    props: {
      contentId: element.dataset.contentId!,
      testsData,
      runtimes,
    },
  });
}
