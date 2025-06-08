import { parseToArray } from '@/utils/helper';
import { CATEGORIES, ICategory, SEARCH_TAGS } from '@/constants/category';

export type Categories = [ICategory, ICategory] | [ICategory] | null;

export default function getCategories(source: string[] | null): Categories {
  const data = parseToArray<keyof typeof SEARCH_TAGS>(source);
  if (!Array.isArray(data) || data.length === 0) return null;

  const category = CATEGORIES.find((c) => c.value === data[0]);

  if (!category) return null;

  const tag = SEARCH_TAGS[category.value]?.find((t) => t.value === data[1]);

  if (!tag) return [category];

  return [category, tag];
}
