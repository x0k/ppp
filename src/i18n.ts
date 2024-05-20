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

export enum Label {}

const strings: Record<Lang, Record<Label, string>> = {
  [Lang.EN]: {},
  [Lang.RU]: {},
};

export function useTranslation(lang: Lang) {
  return (label: Label) => strings[lang][label];
}
