import { ProblemCategory } from "./shared/problems";
import { EditorPanelTab } from './shared/editor-panel-tab';

import type { Locale } from "./paraglide/runtime";
import * as m from './paraglide/messages'

export const NEXT_LANGUAGES: Record<Locale, Locale> = {
  en: "ru",
  ru: "en",
};

export const PROBLEM_CATEGORY_TO_LABEL: Record<ProblemCategory, () => string> = {
  [ProblemCategory.DesignPatterns]: m.designPatterns,
};

export const EDITOR_PANEL_TAB_TO_LABEL: Record<EditorPanelTab, () => string> = {
  [EditorPanelTab.Tests]: m.tests,
  [EditorPanelTab.Output]: m.output,
  [EditorPanelTab.Settings]: m.settings,
};
