import type { languages } from "monaco-editor";

export default {
  comments: {
    lineComment: "//",
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open:"{", close:"}" },
    { open:"[", close:"]" },
    { open:"(", close:")" },
    { open:'"', close:'"' },
    { open:"'", close:"'" },
  ],
  surroundingPairs: [
    { open:"{", close: "}"},
    { open:"[", close: "]"},
    { open:"(", close: ")"},
    { open:'"', close: '"'},
    { open:"'", close: "'"},
  ],
} satisfies languages.LanguageConfiguration;
