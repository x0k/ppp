export enum Language {
  PHP = "php",
  Python = "python",
  TypeScript = "typescript",
  JavaScript = "javascript",
}

export const LANGUAGE_TITLE: Record<Language, string> = {
  [Language.PHP]: `PHP 8.3`,
  [Language.TypeScript]: `TypeScript 5.4.5`,
  [Language.Python]: `Python 3.12.1`,
  [Language.JavaScript]: "JavaScript",
};
