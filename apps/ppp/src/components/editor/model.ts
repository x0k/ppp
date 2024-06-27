import type { editor } from "monaco-editor";

import { Language } from '@/shared/languages';
import { createSyncStorage } from "@/adapters/storage";
import { reactive } from "@/adapters/storage.svelte";

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
  [Language.JavaScript]: "simple-icons:javascript",
  [Language.Python]: "simple-icons:python",
  [Language.TypeScript]: "simple-icons:typescript",
  [Language.Go]: "simple-icons:go",
  [Language.PHP]: "simple-icons:php",
};
