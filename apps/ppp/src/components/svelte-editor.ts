import { mount } from "svelte";

import type { TestData } from "testing";
import {
  makeRemoteTestRunnerFactory,
  type UniversalFactory,
} from "testing/actor";

import {
  GoWorker,
  JsWorker,
  PhpWorker,
  PyWorker,
  TsWorker,
  RustWorker,
  GleamWorker,
} from "@/lib/workers";
import { Language } from "@/shared/languages";
import Editor, {
  type Props,
  type Runtime,
} from "@/components/editor/editor.svelte";
import { WORKER_DESCRIPTIONS } from "@/adapters/workers";

export const LANG_WORKERS: Record<Language, new () => Worker> = {
  [Language.Go]: GoWorker,
  [Language.PHP]: PhpWorker,
  [Language.Python]: PyWorker,
  [Language.TypeScript]: TsWorker,
  [Language.JavaScript]: JsWorker,
  [Language.Rust]: RustWorker,
  [Language.Gleam]: GleamWorker,
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
              Description: WORKER_DESCRIPTIONS[lang as L],
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
