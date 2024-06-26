import { mount } from "svelte";

import type { TestData, TestRunnerFactory } from "testing";

import {
  GoWorker,
  JsWorker,
  PhpWorker,
  PyWorker,
  TsWorker,
} from "@/lib/workers";
import { Language } from "@/shared/languages";
import Editor, { type Props } from "@/components/editor/editor.svelte";
import {
  makeRemoteTestRunnerFactory,
  type UniversalFactory,
} from "testing/actor";

export const LANG_WORKERS: Record<Language, new () => Worker> = {
  [Language.Go]: GoWorker,
  [Language.PHP]: PhpWorker,
  [Language.Python]: PyWorker,
  [Language.TypeScript]: TsWorker,
  [Language.JavaScript]: JsWorker,
};

export function mountEditor<L extends Language, I, O>(
  testsData: TestData<I, O>[],
  runtimes: Record<
    L,
    { initialValue: string; factory: UniversalFactory<I, O, any> }
  >
) {
  const element = document.getElementById("editor-placeholder")!;
  const props = {
    contentId: element.dataset.contentId!,
    testsData,
    runtimes: Object.fromEntries(
      Object.keys(runtimes).map(
        (lang) =>
          [
            lang,
            {
              initialValue: runtimes[lang as L].initialValue,
              testRunnerFactory: makeRemoteTestRunnerFactory(
                LANG_WORKERS[lang as L],
                runtimes[lang as L].factory
              ),
            },
          ] as const
      )
    ) as Record<
      L,
      { initialValue: string; testRunnerFactory: TestRunnerFactory<I, O> }
    >,
  } satisfies Props<L, I, O>;
  mount(Editor, {
    target: element.parentElement!,
    // @ts-expect-error svelte types are wrong
    props,
  });
}
