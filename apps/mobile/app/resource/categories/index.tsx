import { ResourceListScreen } from "@/components/resource/ResourceListScreen";

export default function ResourceCategoriesRoute() {
  return (
    <ResourceListScreen
      title="資源分類"
      subtitle="依照學科與興趣探索學習資源"
      showMajorCategories
    />
  );
}
