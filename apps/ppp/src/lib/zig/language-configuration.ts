import type { languages } from 'monaco-editor';

export default {
	comments: {
		lineComment: '//'
	},
	brackets: [
		['{', '}'],
		['[', ']'],
		['(', ')']
	],
	autoClosingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" }
	],
	surroundingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" }
	]
	// folding: {
	// 	markers: {
	// 		start: '// zig fmt: off\\b',
	// 		end: '// zig fmt: on\\b'
	// 	}
	// },
	// onEnterRules: [
	// 	{
	// 		beforeText: '^\\s*//!.*$',
	// 		action: {
	// 			indent: 'none',
	// 			appendText: '//! '
	// 		}
	// 	},
	// 	{
	// 		beforeText: '^\\s*///.*$',
	// 		action: {
	// 			indent: 'none',
	// 			appendText: '/// '
	// 		}
	// 	},
	// 	{
	// 		beforeText: '^\\s*\\\\\\\\.*$',
	// 		action: {
	// 			indent: 'none',
	// 			appendText: '\\\\'
	// 		}
	// 	}
	// ]
} satisfies languages.LanguageConfiguration;
