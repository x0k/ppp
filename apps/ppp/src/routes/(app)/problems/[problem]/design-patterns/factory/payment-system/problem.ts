import { ProblemCategory, type Problem, type ProblemMeta, type Runtime } from '$lib/problem';
import { type Input, type Output, testCases } from './tests-data';

export const meta = {
	titles: {
		en: 'Payment system',
		ru: 'Платежные системы'
	},
	category: ProblemCategory.DesignPatterns
} satisfies ProblemMeta;

export default {
	meta,
	content: import.meta.glob<string>('./*.md', {
		base: './content',
		import: 'default',
		query: '?raw',
		eager: true
	}),
	runtimes: import.meta.glob<Runtime<Input, Output>>('./*/index.ts', {
		base: './runtimes',
		eager: true
	}),
	testCases
} satisfies Problem<Input, Output>;
