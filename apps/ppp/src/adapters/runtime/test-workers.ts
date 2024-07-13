// import { Language } from "@/shared/languages";

export {default as JsTestWorker } from "./js/test-worker.ts?worker";
export {default as TsTestWorker } from "./ts/test-worker.ts?worker";
export {default as PhpTestWorker } from "./php/test-worker.ts?worker";
export {default as PyTestWorker } from "./python/test-worker.ts?worker";
export {default as GoTestWorker } from "./go/test-worker.ts?worker";
export {default as RustTestWorker } from "./rust/test-worker.ts?worker";
export {default as GleamTestWorker } from "./gleam/test-worker.ts?worker";
// TODO: Fix C# test worker
// export {default as DotnetTestWorker } from "./dotnet/test-worker.ts?worker";

// export const WORKERS: Record<Language, new () => Worker> = {
//   [Language.JavaScript]: JsTestWorker,
//   [Language.TypeScript]: TsTestWorker,
//   [Language.PHP]: PhpTestWorker,
//   [Language.Python]: PyTestWorker,
//   [Language.Go]: GoTestWorker,
//   [Language.Rust]: RustTestWorker,
//   [Language.Gleam]: GleamTestWorker,
//   [Language.CSharp]: DotnetTestWorker,
// };
