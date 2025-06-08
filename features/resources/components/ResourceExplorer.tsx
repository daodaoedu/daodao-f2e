import { Button } from "@/components/atoms/button";
import { resourceSearchParamsSchema } from "@/services/resources";
import useQueryState from "@/hooks/useQueryState";
import ResourceSearchBar from "./ResourceSearchBar";
import ResourceContainer from "./ResourceContainer";
import { useResourceList } from "../hooks";
import { CategoriesType } from "../utils/getCategories";

interface ResourceExplorerProps {
  categories?: CategoriesType;
  parentDataCount?: number;
}

export default function ResourceExplorer({
  categories,
  parentDataCount,
}: ResourceExplorerProps) {
  const [filters, setFilters] = useQueryState(resourceSearchParamsSchema);
  const { data: resourcesData } = useResourceList(filters);

  return (
    <div className="flex flex-col gap-6">
      <ResourceSearchBar filters={filters} onFilter={setFilters} />

      {filters.query && (
        <div className="text-basic-500 body-sm px-5 pb-6 md:px-24">
          "{filters.query}" 共搜尋到
          <span className="mx-1 text-primary-base font-bold">
            {resourcesData?.resources?.length ?? 0}
          </span>
          筆
        </div>
      )}

      <ResourceContainer
        data={resourcesData?.resources ?? []}
        categories={categories}
        parentDataCount={parentDataCount}
        className="px-5 md:px-24"
      />

      <div className="flex justify-center px-5 pt-6 mb-16 md:px-24">
        <Button size="lg">查看更多</Button>
      </div>
    </div>
  );
}
