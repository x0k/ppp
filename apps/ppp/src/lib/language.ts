import type { Component } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

import VscodeIconsFileTypeJs from '~icons/vscode-icons/file-type-js';
import VscodeIconsFileTypePython from '~icons/vscode-icons/file-type-python';
import VscodeIconsFileTypeTypescript from '~icons/vscode-icons/file-type-typescript';
import VscodeIconsFileTypeGo from '~icons/vscode-icons/file-type-go';
import VscodeIconsFileTypePhp from '~icons/vscode-icons/file-type-php';
import VscodeIconsFileTypeRust from '~icons/vscode-icons/file-type-rust';
import VscodeIconsFileTypeGleam from '~icons/vscode-icons/file-type-gleam';
import VscodeIconsFileTypeCsharp from '~icons/vscode-icons/file-type-csharp';
import VscodeIconsFileTypeJava from '~icons/vscode-icons/file-type-java';
import VscodeIconsFileTypeRuby from '~icons/vscode-icons/file-type-ruby';

export enum Language {
	JavaScript = 'javascript',
	TypeScript = 'typescript',
	Python = 'python',
	PHP = 'php',
	Go = 'go',
	Rust = 'rust',
	Gleam = 'gleam',
	CSharp = 'csharp',
	Java = 'java',
	Ruby = 'ruby'
}

export const LANGUAGES = Object.values(Language).sort();

export const LANGUAGE_TITLE: Record<Language, string> = {
	[Language.PHP]: 'PHP',
	[Language.TypeScript]: 'TypeScript',
	[Language.Python]: 'Python',
	[Language.JavaScript]: 'JavaScript',
	[Language.Go]: 'Go',
	[Language.Rust]: 'Rust',
	[Language.Gleam]: 'Gleam',
	[Language.CSharp]: 'CSharp',
	[Language.Java]: 'Java',
	[Language.Ruby]: 'Ruby'
};

export const LANGUAGE_ICONS: Record<Language, Component<SVGAttributes<SVGSVGElement>>> = {
	[Language.JavaScript]: VscodeIconsFileTypeJs,
	[Language.Python]: VscodeIconsFileTypePython,
	[Language.TypeScript]: VscodeIconsFileTypeTypescript,
	[Language.Go]: VscodeIconsFileTypeGo,
	[Language.PHP]: VscodeIconsFileTypePhp,
	[Language.Rust]: VscodeIconsFileTypeRust,
	[Language.Gleam]: VscodeIconsFileTypeGleam,
	[Language.CSharp]: VscodeIconsFileTypeCsharp,
	[Language.Java]: VscodeIconsFileTypeJava,
	[Language.Ruby]: VscodeIconsFileTypeRuby
};

export function isLanguage(lang: string): lang is Language {
	return lang in LANGUAGE_TITLE;
}
