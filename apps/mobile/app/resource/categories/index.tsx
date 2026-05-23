import { ResourceListScreen } from "@/components/resource/ResourceListScreen";
import { useMobileTranslation } from "@/i18n";

export default function ResourceCategoriesRoute() {
  const t = useMobileTranslation("mobile.resources");

  return (
    <ResourceListScreen
      title={t("category_route_title")}
      subtitle={t("category_route_subtitle")}
      showMajorCategories
    />
  );
}
