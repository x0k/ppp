import { getContext, setContext } from "svelte";
import type { editor } from "monaco-editor";
import type { Terminal } from "@xterm/xterm";
import type { FitAddon } from '@xterm/addon-fit';

export class EditorContext {
  editor = $state<editor.IStandaloneCodeEditor>();
  constructor(
    public model: editor.ITextModel,
    public terminal: Terminal,
    public terminalFitAddon: FitAddon
  ) {}
}

const EDITOR_CONTEXT = Symbol("editor-context");

export function setEditorContext(ctx: EditorContext) {
  setContext(EDITOR_CONTEXT, ctx);
}

export function getEditorContext() {
  return getContext<EditorContext>(EDITOR_CONTEXT);
}
