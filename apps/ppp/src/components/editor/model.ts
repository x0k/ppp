import type { editor } from "monaco-editor";

import type { Context } from 'libs/context';
import type { Writer } from 'libs/io';
import type { TestCompiler } from 'testing';

import { Language } from "@/shared/languages";
import { createSyncStorage } from "@/adapters/storage";
import { reactive } from "@/adapters/storage.svelte";

export type TestCompilerFactory<I, O> = (
  ctx: Context,
  out: Writer,
) => Promise<TestCompiler<I, O>>;

export interface SurfaceApi {
  editor: editor.IStandaloneCodeEditor | undefined;
  width: number;
  panelHeight: number;
  isPanelCollapsed: boolean;
  showPanel(height: number): boolean;
  hidePanel(): boolean;
  togglePanel(height: number): boolean;
}

export const vimState = reactive(
  createSyncStorage(localStorage, "editor-vim", false)
);

export const testRunnerTimeout = reactive(
  createSyncStorage(localStorage, "editor-test-runner-timeout", 60000)
);

export const LANG_ICONS: Record<Language, string> = {
  [Language.JavaScript]: "vscode-icons:file-type-js",
  [Language.Python]: "vscode-icons:file-type-python",
  [Language.TypeScript]: "vscode-icons:file-type-typescript",
  [Language.Go]: "vscode-icons:file-type-go",
  [Language.PHP]: "vscode-icons:file-type-php",
  [Language.Rust]: "vscode-icons:file-type-rust",
  [Language.Gleam]: "vscode-icons:file-type-gleam",
  [Language.CSharp]: "vscode-icons:file-type-csharp",
};
