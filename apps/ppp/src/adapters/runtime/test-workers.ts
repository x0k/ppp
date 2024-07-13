import { Language } from "@/shared/languages";

import JsTestWorker from "./js/test-worker.ts?worker";
import TsTestWorker from "./ts/test-worker.ts?worker";
import PhpTestWorker from "./php/test-worker.ts?worker";
import PyTestWorker from "./python/test-worker.ts?worker";
import GoTestWorker from "./go/test-worker.ts?worker";
import RustTestWorker from "./rust/test-worker.ts?worker";
import GleamTestWorker from "./gleam/test-worker.ts?worker";
import DotnetTestWorker from "./dotnet/test-worker.ts?worker";

export const DESCRIPTIONS: Record<Language, new () => Worker> = {
  [Language.JavaScript]: JsTestWorker,
  [Language.TypeScript]: TsTestWorker,
  [Language.PHP]: PhpTestWorker,
  [Language.Python]: PyTestWorker,
  [Language.Go]: GoTestWorker,
  [Language.Rust]: RustTestWorker,
  [Language.Gleam]: GleamTestWorker,
  [Language.CSharp]: DotnetTestWorker,
};
