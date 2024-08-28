import { loadWASM } from "onigasm";
import * as monaco from "monaco-editor";
import { Registry } from "monaco-textmate";
import { wireTmGrammars } from "monaco-editor-textmate";

//@ts-expect-error
import onigasmWasmUrl from "onigasm/lib/onigasm.wasm";

import { Language } from "@/shared/languages";

import gleamConfiguration from "./gleam/language-configuration";
import gleamGrammarUrl from "./gleam/gleam.tmLanguage.json?url";

export const MONACO_LANGUAGE_ID: Record<Language, string> = {
  [Language.PHP]: "php",
  [Language.TypeScript]: "typescript",
  [Language.JavaScript]: "javascript",
  [Language.Python]: "python",
  [Language.Go]: "go",
  [Language.Rust]: "rust",
  [Language.Gleam]: Language.Gleam,
  [Language.CSharp]: "csharp",
  [Language.Java]: "java",
  [Language.Ruby]: "ruby",
};

const LANGUAGE_ID_SCOPE_NAME = {
  [Language.Gleam]: "source.gleam",
};

monaco.languages.register({ id: Language.Gleam });
monaco.languages.setLanguageConfiguration(Language.Gleam, gleamConfiguration);

export async function loadTmGrammars() {
  await loadWASM(onigasmWasmUrl);

  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      switch (scopeName) {
        case LANGUAGE_ID_SCOPE_NAME[Language.Gleam]:
          return {
            format: "json",
            content: await (await fetch(gleamGrammarUrl)).json(),
          };
        default:
          throw new Error(`Unknown scope name: ${scopeName}`);
      }
    },
  });

  const grammars = new Map(Object.entries(LANGUAGE_ID_SCOPE_NAME));

  return wireTmGrammars(monaco, registry, grammars);
}
