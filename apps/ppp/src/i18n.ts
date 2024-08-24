import { Page, TITLE } from "./shared";
import { ProblemCategory } from "./shared/problems";
import { EditorPanelTab } from "./shared/editor-panel-tab";

export enum Lang {
  EN = "en",
  RU = "ru",
}

const NEXT_LANGUAGES: Record<Lang, Lang> = {
  [Lang.EN]: Lang.RU,
  [Lang.RU]: Lang.EN,
};

export function getNextLang(lang: Lang): Lang {
  return NEXT_LANGUAGES[lang];
}

export enum Label {
  MainPage = "page:main",
  ProblemsPage = "page:problems",
  ProblemsCategoryDesignPatterns = "problems:category:design-patterns",
  EditorPanelTabTests = "editor:panel:tab:tests",
  EditorPanelTabOutput = "editor:panel:tab:output",
  EditorPanelTabSettings = "editor:panel:tab:settings",
  EditorSettingsVimMode = "editor:settings:vim-mode",
  EditorRunButton = "editor:button:run",
  EditorStopButton = "editor:button:stop",
  EditorSettingsExecutionTimeout = "editor:settings:execution-timeout",
  EditorSettingsExecutionTimeoutAlt = "editor:settings:execution-timeout-alt",
}

const strings: Record<Lang, Record<Label, string>> = {
  [Lang.EN]: {
    [Label.MainPage]: TITLE,
    [Label.ProblemsPage]: "Problems",
    [Label.ProblemsCategoryDesignPatterns]: "Design Patterns",
    [Label.EditorPanelTabTests]: "Tests",
    [Label.EditorPanelTabOutput]: "Output",
    [Label.EditorPanelTabSettings]: "Settings",
    [Label.EditorSettingsVimMode]: "Vim mode",
    [Label.EditorRunButton]: "Run",
    [Label.EditorStopButton]: "Stop",
    [Label.EditorSettingsExecutionTimeout]: "Execution timeout (ms)",
    [Label.EditorSettingsExecutionTimeoutAlt]: "Use zero to disable",
  },
  [Lang.RU]: {
    [Label.MainPage]: TITLE,
    [Label.ProblemsPage]: "Проблемы",
    [Label.ProblemsCategoryDesignPatterns]: "Паттерны проектирования",
    [Label.EditorPanelTabTests]: "Тесты",
    [Label.EditorPanelTabOutput]: "Вывод",
    [Label.EditorPanelTabSettings]: "Настройки",
    [Label.EditorSettingsVimMode]: "Режим Vim",
    [Label.EditorRunButton]: "Запустить",
    [Label.EditorStopButton]: "Остановить",
    [Label.EditorSettingsExecutionTimeout]: "Таймаут выполнения (мс)",
    [Label.EditorSettingsExecutionTimeoutAlt]: "Используйте ноль для отключения",
  },
};

export function useTranslations(lang: Lang) {
  return (label: Label) => strings[lang][label];
}

const PAGE_TO_LABEL: Record<Page, Label> = {
  [Page.Main]: Label.MainPage,
  [Page.Problems]: Label.ProblemsPage,
};

export function getPageLabel(page: Page): Label {
  return PAGE_TO_LABEL[page];
}

const PROBLEM_CATEGORY_TO_LABEL: Record<ProblemCategory, Label> = {
  [ProblemCategory.DesignPatterns]: Label.ProblemsCategoryDesignPatterns,
};

export function getProblemCategoryLabel(category: ProblemCategory): Label {
  return PROBLEM_CATEGORY_TO_LABEL[category];
}

const EDITOR_PANEL_TAB_TO_LABEL: Record<EditorPanelTab, Label> = {
  [EditorPanelTab.Tests]: Label.EditorPanelTabTests,
  [EditorPanelTab.Output]: Label.EditorPanelTabOutput,
  [EditorPanelTab.Settings]: Label.EditorPanelTabSettings,
};

export function getEditorPanelTabLabel(tab: EditorPanelTab): Label {
  return EDITOR_PANEL_TAB_TO_LABEL[tab];
}
