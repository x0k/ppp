import { Page } from './shared';

export enum ProblemCategory {
  DesignPatterns = "design-patterns",
}

export const PROBLEM_CATEGORIES = Object.values(ProblemCategory)

export function problemCategoryPage(category: ProblemCategory): string {
  return `${Page.Problems}/${category}`
}
