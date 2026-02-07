import { CATEGORIES, type ICategory, SEARCH_TAGS } from "@/constants/resource";

export function parseCategoryHierarchy(source: string[] | null): ICategory[] {
  if (!Array.isArray(source) || source.length === 0) return [];

  const category = CATEGORIES.find((c) => c.value === source[0]);

  if (!category) return [];

  const tag = SEARCH_TAGS[category.value]?.find((t) => t.value === source[1]);

  if (!tag) return [category];

  return [category, tag];
}

export function getCategories(categoryHierarchy: string[] | undefined): ICategory[] {
  const [majorCategoryKey] = categoryHierarchy ?? [];

  if (!Array.isArray(categoryHierarchy) || categoryHierarchy.length === 0) {
    return CATEGORIES;
  }
  if (categoryHierarchy.length === 1 && majorCategoryKey) {
    return SEARCH_TAGS[majorCategoryKey] ?? [];
  }
  return [];
}
