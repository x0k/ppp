import type { Component } from "svelte";

import { Language } from "@/shared/languages";

import JsDescription from "./js/description.svelte";
import TsDescription from "./ts/description.svelte";
import PhpDescription from "./php/description.svelte";
import PyDescription from "./python/description.svelte";
import GoDescription from "./go/description.svelte";
import RustDescription from "./rust/description.svelte";
import GleamDescription from "./gleam/description.svelte";
import DotnetDescription from "./dotnet/description.svelte";

export const DESCRIPTIONS: Record<Language, Component> = {
  [Language.JavaScript]: JsDescription,
  [Language.TypeScript]: TsDescription,
  [Language.PHP]: PhpDescription,
  [Language.Python]: PyDescription,
  [Language.Go]: GoDescription,
  [Language.Rust]: RustDescription,
  [Language.Gleam]: GleamDescription,
  [Language.CSharp]: DotnetDescription,
};
