export enum Language {
  PHP = "php",
  Python = "python",
  TypeScript = "typescript",
  JavaScript = "javascript",
  Go = "go",
  Rust = "rust",
  Gleam = "gleam",
  CSharp = "csharp",
  Java = "java",
}

export const LANGUAGES = Object.values(Language);

export const LANGUAGE_TITLE: Record<Language, string> = {
  [Language.PHP]: "PHP",
  [Language.TypeScript]: "TypeScript",
  [Language.Python]: "Python",
  [Language.JavaScript]: "JavaScript",
  [Language.Go]: "Go",
  [Language.Rust]: "Rust",
  [Language.Gleam]: "Gleam",
  [Language.CSharp]: "CSharp",
  [Language.Java]: "Java",
};
