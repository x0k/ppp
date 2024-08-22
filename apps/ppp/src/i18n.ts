import { Page, TITLE } from "./shared";
import { ProblemCategory } from "./shared/problems";

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
}

const strings: Record<Lang, Record<Label, string>> = {
  [Lang.EN]: {
    [Label.MainPage]: TITLE,
    [Label.ProblemsPage]: "Problems",
    [Label.ProblemsCategoryDesignPatterns]: "Design Patterns",
  },
  [Lang.RU]: {
    [Label.MainPage]: TITLE,
    [Label.ProblemsPage]: "Проблемы",
    [Label.ProblemsCategoryDesignPatterns]: "Паттерны проектирования",
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
