export enum Language {
  JavaScript = "javascript",
  TypeScript = "typescript",
  Python = "python",
  PHP = "php",
  Go = "go",
  Rust = "rust",
  Gleam = "gleam",
  CSharp = "csharp",
  Java = "java",
  Ruby = "ruby",
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
  [Language.Ruby]: "Ruby",
};

export const LANGUAGE_ICONS: Record<Language, string> = {
  [Language.JavaScript]: "vscode-icons:file-type-js",
  [Language.Python]: "vscode-icons:file-type-python",
  [Language.TypeScript]: "vscode-icons:file-type-typescript",
  [Language.Go]: "vscode-icons:file-type-go",
  [Language.PHP]: "vscode-icons:file-type-php",
  [Language.Rust]: "vscode-icons:file-type-rust",
  [Language.Gleam]: "vscode-icons:file-type-gleam",
  [Language.CSharp]: "vscode-icons:file-type-csharp",
  [Language.Java]: "vscode-icons:file-type-java",
  [Language.Ruby]: "vscode-icons:file-type-ruby",
};
