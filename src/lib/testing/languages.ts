import { version } from "typescript";

export enum Language {
  PHP = "php",
  TypeScript = "typescript",
  JavaScript = "javascript",
}

export const LANGUAGE_TITLE: Record<Language, string> = {
  [Language.PHP]: "PHP 8.3",
  [Language.TypeScript]: `TypeScript ${version}`,
  [Language.JavaScript]: "JavaScript",
};
