import { getContext, setContext } from "svelte";

import { EditorPanelTab } from "@/shared/editor-panel-tab";

export class EditorPanelContext {
  selectedTab = $state<EditorPanelTab>();

  constructor(selectedTab: EditorPanelTab) {
    this.selectedTab = selectedTab;
  }
}

const EDITOR_PANEL_CONTEXT = Symbol("editor-panel-context");

export function setEditorPanelContext(ctx: EditorPanelContext) {
  setContext(EDITOR_PANEL_CONTEXT, ctx);
}

export function getEditorPanelContext() {
  return getContext<EditorPanelContext>(EDITOR_PANEL_CONTEXT);
}
