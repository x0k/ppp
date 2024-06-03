import { tsVersion } from './js'
import { version as phpVersion } from './php'
import { version as pyVersion } from './python'

export enum Language {
  PHP = "php",
  Python = "python",
  TypeScript = "typescript",
  JavaScript = "javascript",
}

export const LANGUAGE_TITLE: Record<Language, string> = {
  [Language.PHP]: `PHP ${phpVersion}`,
  [Language.TypeScript]: `TypeScript ${tsVersion}`,
  [Language.Python]: `Python ${pyVersion}`,
  [Language.JavaScript]: "JavaScript",
};
