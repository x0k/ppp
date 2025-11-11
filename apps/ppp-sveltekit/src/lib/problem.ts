import { Page } from '$lib/routes';
import { m } from '$lib/paraglide/messages';

export enum ProblemCategory {
	DesignPatterns = 'design-patterns'
}

export const PROBLEM_CATEGORIES = Object.values(ProblemCategory);

export function problemCategoryPage(category: ProblemCategory): string {
	return `${Page.Problems}/${category}`;
}

export const PROBLEM_CATEGORY_TO_LABEL: Record<ProblemCategory, () => string> = {
	[ProblemCategory.DesignPatterns]: m.designPatterns
};
