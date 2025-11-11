import { type Snippet } from 'svelte';
import type { TestCase, TestCompilerFactory } from 'libs/testing';

import { type Language } from '$lib/language';
import { type ProblemCategory } from '$lib/problem';

export interface Runtime<I, O> {
	initialValue: string;
	testCompilerFactory: TestCompilerFactory<I, O>;
}

export interface Props<L extends Language, I, O> {
	problemCategory: ProblemCategory;
	contentId: string;
	testCases: TestCase<I, O>[];
	runtimes: Record<L, Runtime<I, O>>;
	children: Snippet;
}

export const EDITOR_MIN_WIDTH = 5;
export const DESCRIPTION_PANEL_MIN_WIDTH = 600;
export const DESCRIPTION_PANEL_FLIP_POINT = DESCRIPTION_PANEL_MIN_WIDTH / 2;
