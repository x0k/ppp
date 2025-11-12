import { m } from '$lib/paraglide/messages';

export enum EditorPanelTab {
  Tests = "tests",
  Output = "output",
  Settings = "settings",
}

export const EDITOR_PANEL_TAB_TO_LABEL: Record<EditorPanelTab, () => string> = {
  [EditorPanelTab.Tests]: m.tests,
  [EditorPanelTab.Output]: m.output,
  [EditorPanelTab.Settings]: m.settings,
};

