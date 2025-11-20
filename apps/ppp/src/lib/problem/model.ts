import type { TestCase, TestCompilerFactory } from 'libs/testing';

import { m } from '$lib/paraglide/messages';
import type { Locale } from '$lib/paraglide/runtime';
import type { RemoteCompilerFactoryOptions } from 'libs/compiler/actor';

export enum ProblemCategory {
	DesignPatterns = 'design-patterns'
}

export interface ProblemMeta {
	titles: Record<Locale, string>;
	category: ProblemCategory;
}

export interface Problem<I, O> {
	meta: ProblemMeta;
	content: Record<string, string>;
	runtimes: Record<string, Runtime<I, O>>;
	testCases: TestCase<I, O>[];
}

export const PROBLEM_CATEGORIES = Object.values(ProblemCategory);

export const PROBLEM_CATEGORY_TO_LABEL: Record<ProblemCategory, () => string> = {
	[ProblemCategory.DesignPatterns]: m.design_patterns
};

export interface Runtime<I, O> {
	code: string;
	factory: TestCompilerFactory<RemoteCompilerFactoryOptions, I, O>;
}

export const EDITOR_MIN_WIDTH = 5;
export const DESCRIPTION_PANEL_MIN_WIDTH = 500;
export const DESCRIPTION_PANEL_FLIP_POINT = DESCRIPTION_PANEL_MIN_WIDTH / 2;
