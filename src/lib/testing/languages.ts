import { version as tsVersion } from "./ts/version";
import { version as phpVersion } from "./php/version";
import { version as pythonVersion } from "./python/version";

export enum Language {
  PHP = "php",
  Python = "python",
  TypeScript = "typescript",
  JavaScript = "javascript",
}

export const LANGUAGE_TITLE: Record<Language, string> = {
  [Language.PHP]: `PHP ${phpVersion}`,
  [Language.TypeScript]: `TypeScript ${tsVersion}`,
  [Language.Python]: `Python ${pythonVersion}`,
  [Language.JavaScript]: "JavaScript",
};
