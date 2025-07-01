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

      <Container className="pb-6">
        <ResourceContainer
          data={resourcesData}
          categories={categories}
          parentDataCount={parentDataCount}
        />
      </Container>

      <div className="flex justify-center px-5 pt-6 mb-16 md:px-24">
        <Button size="lg">查看更多</Button>
      </div>
    </div>
  );
}
