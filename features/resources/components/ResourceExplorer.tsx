import { Button } from "@/components/ui/button";
import { resourceSearchParamsSchema } from "@/services/resources";
import { ICategory } from "@/constants/category";
import { Container } from "@/components/ui/wrapper";
import useQueryState from "@/hooks/useQueryState";
import ResourceSearchBar from "./ResourceSearchBar";
import ResourceContainer from "./ResourceContainer";
import { useResourceList } from "../hooks";

interface ResourceExplorerProps {
  categories?: ICategory[];
  parentDataCount?: number;
}

export default function ResourceExplorer({
  categories,
  parentDataCount,
}: ResourceExplorerProps) {
  const [filters, setFilters] = useQueryState(resourceSearchParamsSchema);
  const {
    data: resourcesData,
    hasMore,
    totalCount,
    setSize,
  } = useResourceList({
    ...filters,
    majorCategory: categories?.[0]?.value,
    subCategory: categories?.[1]?.value,
  });

  return (
    <div className="flex flex-col gap-6">
      <ResourceSearchBar filters={filters} onFilter={setFilters} />

      {filters.query && (
        <div className="text-basic-500 body-sm px-5 pb-6 md:px-24">
          "{filters.query}" 共搜尋到
          <span className="mx-1 text-primary-base font-bold">{totalCount}</span>
          筆
        </div>
      )}

      <Container className="pb-6">
        <ResourceContainer
          data={resourcesData}
          categories={categories}
          parentDataCount={parentDataCount}
        />
      </Container>

      {hasMore && (
        <div className="flex justify-center px-5 mb-16 md:px-24">
          <Button size="lg" onClick={() => setSize((pre) => pre + 1)}>
            查看更多
          </Button>
        </div>
      )}
    </div>
  );
}
