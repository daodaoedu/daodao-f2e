import { useLocalSearchParams } from "expo-router";
import { ResourceListScreen } from "@/components/resource/ResourceListScreen";
import {
  getResourceCategory,
  getResourceSubcategory,
  RESOURCE_SUBCATEGORIES,
} from "@/constants/resource";
import { useMobileTranslation } from "@/i18n";

function normalizeCategories(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default function ResourceCategoryDetailRoute() {
  const t = useMobileTranslation("mobile.resources");
  const { categories } = useLocalSearchParams<{ categories?: string | string[] }>();
  const [majorCategoryValue, subCategoryValue] = normalizeCategories(categories);
  const majorCategory = getResourceCategory(majorCategoryValue);
  const subCategory = getResourceSubcategory(majorCategoryValue, subCategoryValue);
  const translateValue = (key: string | undefined, fallback: string | undefined) => {
    if (!key) return fallback;
    const translated = t(key);
    return translated === `mobile.resources.${key}` ? fallback : translated;
  };
  const title =
    translateValue(
      subCategory ? `subcategory_${subCategory.value}` : undefined,
      subCategory?.label
    ) ??
    translateValue(majorCategory ? `category_${majorCategory.value}` : undefined, majorCategory?.label) ??
    t("category_detail_fallback_title");

  return (
    <ResourceListScreen
      title={title}
      subtitle={t("category_detail_subtitle", { title })}
      params={{
        majorCategory: majorCategory?.value,
        subCategory: subCategory?.value,
      }}
      showMajorCategories={false}
      subcategories={majorCategory ? RESOURCE_SUBCATEGORIES[majorCategory.value] : []}
    />
  );
}
