import { Page, TITLE } from "./shared";

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
  ProblemPage = "page:problem",
}

const strings: Record<Lang, Record<Label, string>> = {
  [Lang.EN]: {
    [Label.MainPage]: TITLE,
    [Label.ProblemPage]: "Problem",
  },
  [Lang.RU]: {
    [Label.MainPage]: TITLE,
    [Label.ProblemPage]: "Задача",
  },
};

export function useTranslations(lang: Lang) {
  return (label: Label) => strings[lang][label];
}

const PAGE_TO_LABEL: Record<Page, Label> = {
  [Page.Main]: Label.MainPage,
  [Page.Problem]: Label.ProblemPage,
};

export function getPageLabel(page: Page): Label {
  return PAGE_TO_LABEL[page];
}