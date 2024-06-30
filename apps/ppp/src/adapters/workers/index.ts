import type { ComponentType, SvelteComponent } from "svelte";

import { Language } from "@/shared/languages";

import JsWorkerDescription from "./js-worker-description.svelte";
import TsWorkerDescription from "./ts-worker-description.svelte";
import PhpWorkerDescription from "./php-worker-description.svelte";
import PyWorkerDescription from "./python-worker-description.svelte";
import GoWorkerDescription from "./go-worker-description.svelte";
import RustWorkerDescription from "./rust-worker-description.svelte";

export const WORKER_DESCRIPTIONS: Record<
  Language,
  ComponentType<SvelteComponent<Record<string, never>>>
> = {
  [Language.JavaScript]: JsWorkerDescription,
  [Language.TypeScript]: TsWorkerDescription,
  [Language.PHP]: PhpWorkerDescription,
  [Language.Python]: PyWorkerDescription,
  [Language.Go]: GoWorkerDescription,
  [Language.Rust]: RustWorkerDescription,
};
