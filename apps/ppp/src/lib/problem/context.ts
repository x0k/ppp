import { createContext } from 'svelte';

import type { ProblemCategory } from './model';

export interface CategoryContext {
  category: ProblemCategory
}

export const [getCategoryContext, setCategoryContext] = createContext<CategoryContext>()
