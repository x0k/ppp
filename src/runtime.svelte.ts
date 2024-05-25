export const LANGUAGE = {
  PHP: {
    WASM: "php-wasm",
  },
} as const;

export type Language = keyof typeof LANGUAGE;
export type Runtime =
  (typeof LANGUAGE)[Language][keyof (typeof LANGUAGE)[Language]];

export const RUNTIME_TITLE: Record<Runtime, string> = {
  [LANGUAGE.PHP.WASM]: "PHP 8.2.11",
};
