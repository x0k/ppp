export enum Language {
  PHP = "php",
  Python = "python",
  TypeScript = "typescript",
  JavaScript = "javascript",
  Go = "go",
  Rust = "rust",
}

export const LANGUAGE_TITLE: Record<Language, string> = {
  [Language.PHP]: "PHP",
  [Language.TypeScript]: "TypeScript",
  [Language.Python]: "Python",
  [Language.JavaScript]: "JavaScript",
  [Language.Go]: "Go",
  [Language.Rust]: "Rust",
};
