import { loadWASM } from 'onigasm';
import * as monaco from 'monaco-editor';
import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';

import onigasmWasmUrl from 'onigasm/lib/onigasm.wasm?url';

import { Language } from '$lib/language';
import gleamConfiguration from '$lib/gleam/language-configuration';
import gleamGrammarUrl from '$lib/gleam/gleam.tmLanguage.json?url';
import zigConfiguration from '$lib/zig/language-configuration';
import zigGrammarUrl from '$lib/zig/zig.tmLanguage.json?url';

export const MONACO_LANGUAGE_ID: Record<Language, string> = {
	[Language.PHP]: 'php',
	[Language.TypeScript]: 'typescript',
	[Language.JavaScript]: 'javascript',
	[Language.Python]: 'python',
	[Language.Go]: 'go',
	[Language.Rust]: 'rust',
	[Language.Gleam]: Language.Gleam,
	[Language.CSharp]: 'csharp',
	[Language.Java]: 'java',
	[Language.Ruby]: 'ruby',
	[Language.Zig]: Language.Zig
};

const SCOPE_NAME_META = new Map<
	string,
	{ lang: Language; grammarUrl: string; config: monaco.languages.LanguageConfiguration }
>([
	[
		'source.gleam',
		{ lang: Language.Gleam, grammarUrl: gleamGrammarUrl, config: gleamConfiguration }
	],
	['source.zig', { lang: Language.Zig, grammarUrl: zigGrammarUrl, config: zigConfiguration }]
]);

for (const [, meta] of SCOPE_NAME_META) {
	monaco.languages.register({ id: meta.lang });
	monaco.languages.setLanguageConfiguration(meta.lang, meta.config);
}

export async function loadTmGrammars() {
	await loadWASM(onigasmWasmUrl);

	const registry = new Registry({
		getGrammarDefinition: async (scopeName) => {
			const config = SCOPE_NAME_META.get(scopeName);
			if (!config) {
				throw new Error(`Unknown scope name: ${scopeName}`);
			}
			return {
				format: 'json',
				content: await fetch(config.grammarUrl).then((r) => r.json())
			};
		}
	});

	const grammars = new Map(SCOPE_NAME_META.entries().map(([scope, meta]) => [meta.lang, scope]));
	return wireTmGrammars(monaco, registry, grammars);
}
