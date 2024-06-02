export enum Language {
  PHP = "php",
}

export enum Runner {
  PhpWasm = "php-wasm",
}

export const LANGUAGE_RUNNERS: Record<Language, Runner[]> = {
  [Language.PHP]: [Runner.PhpWasm],
};

export const RUNNER_LANGUAGES: Record<Runner, Language> = {
  [Runner.PhpWasm]: Language.PHP,
};

export const RUNNER_TITLES: Record<Runner, string> = {
  [Runner.PhpWasm]: "PHP 8.3",
};
