import type { editor } from "monaco-editor";

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
  createSyncStorage(localStorage, "editor-test-runner-timeout", 8000)
);
