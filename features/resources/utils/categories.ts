import { parseToArray } from '@/shared/lib/helper';
import { CATEGORIES, ICategory, SEARCH_TAGS } from '@/constants/category';

export function parseCategoryHierarchy(source: string[] | null): ICategory[] {
  const data = parseToArray<keyof typeof SEARCH_TAGS>(source);
  if (!Array.isArray(data) || data.length === 0) return [];

  const category = CATEGORIES.find((c) => c.value === data[0]);

  if (!category) return [];

  const tag = SEARCH_TAGS[category.value]?.find((t) => t.value === data[1]);

  if (!tag) return [category];

  return [category, tag];
}

export function getCategories(
  categoryHierarchy: string[] | undefined
): ICategory[] {
  const [majorCategoryKey] = categoryHierarchy ?? [];

  if (!Array.isArray(categoryHierarchy) || categoryHierarchy.length === 0) {
    return CATEGORIES;
  }
  if (categoryHierarchy.length === 1 && majorCategoryKey) {
    return SEARCH_TAGS[majorCategoryKey] ?? [];
  }
  return [];
}
