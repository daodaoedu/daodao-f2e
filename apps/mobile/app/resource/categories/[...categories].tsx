import { useLocalSearchParams } from "expo-router";
import { ResourceListScreen } from "@/components/resource/ResourceListScreen";
import {
  getResourceCategory,
  getResourceSubcategory,
  RESOURCE_SUBCATEGORIES,
} from "@/constants/resource";

function normalizeCategories(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default function ResourceCategoryDetailRoute() {
  const { categories } = useLocalSearchParams<{ categories?: string | string[] }>();
  const [majorCategoryValue, subCategoryValue] = normalizeCategories(categories);
  const majorCategory = getResourceCategory(majorCategoryValue);
  const subCategory = getResourceSubcategory(majorCategoryValue, subCategoryValue);
  const title = subCategory?.label ?? majorCategory?.label ?? "資源分類";

  return (
    <ResourceListScreen
      title={title}
      subtitle={`探索 ${title} 相關的學習資源`}
      params={{
        majorCategory: majorCategory?.value,
        subCategory: subCategory?.value,
      }}
      showMajorCategories={false}
      subcategories={majorCategory ? RESOURCE_SUBCATEGORIES[majorCategory.value] : []}
    />
  );
}
