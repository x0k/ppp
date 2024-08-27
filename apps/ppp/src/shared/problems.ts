import { Page } from './shared';

export enum ProblemCategory {
  DesignPatterns = "design-patterns",
}

export function problemCategoryPage(category: ProblemCategory): string {
  return `${Page.Problems}/${category}`
}
