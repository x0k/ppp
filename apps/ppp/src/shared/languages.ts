import { version as goVersion } from "testing-go/version";
import { version as phpVersion } from "testing-php/version";
import { version as pythonVersion } from "testing-python/version";
import { version as typescriptVersion } from "testing-typescript/version";

export enum Language {
  PHP = "php",
  Python = "python",
  TypeScript = "typescript",
  JavaScript = "javascript",
  Go = "go",
}

export const LANGUAGE_TITLE: Record<Language, string> = {
  [Language.PHP]: `PHP ${phpVersion}`,
  [Language.TypeScript]: `TypeScript ${typescriptVersion}`,
  [Language.Python]: `Python ${pythonVersion}`,
  [Language.JavaScript]: "JavaScript",
  [Language.Go]: `Go ${goVersion}`,
};
