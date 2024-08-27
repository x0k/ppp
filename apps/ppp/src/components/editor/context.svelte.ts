import { getContext, setContext } from "svelte";
import type { editor } from "monaco-editor";
import type { Terminal } from "@xterm/xterm";
import type { FitAddon } from '@xterm/addon-fit';

import type { Lang } from "@/i18n";

export class EditorContext {
  editor = $state<editor.IStandaloneCodeEditor>();
  constructor(
    public readonly lang: Lang,
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
