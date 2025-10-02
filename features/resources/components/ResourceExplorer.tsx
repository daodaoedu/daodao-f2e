import { Button } from '@/shared/ui/button';
import { resourceSearchParamsSchema } from '@/services/resources';
import { ICategory } from '@/constants/category';
import { Container } from '@/shared/ui/wrapper';
import useQueryState from '@/hooks/useQueryState';
import ResourceSearchBar from './ResourceSearchBar';
import ResourceContainer from './ResourceContainer';
import { useResourceList } from '../hooks';

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
    isLoading,
    isValidating,
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
        <Container className="body-sm pb-6 text-basic-500">
          "
          {filters.query}
          " 共搜尋到
          <span className="mx-1 font-bold text-primary-base">{totalCount}</span>
          筆
        </Container>
      )}

      <Container className="pb-6">
        <ResourceContainer
          isLoading={isLoading}
          isValidating={isValidating}
          data={resourcesData}
          categories={categories}
          parentDataCount={parentDataCount}
        />
      </Container>

      {hasMore && (
        <div className="mb-16 flex justify-center px-5 md:px-24">
          <Button size="lg" onClick={() => setSize((pre) => pre + 1)}>
            查看更多
          </Button>
        </div>
      )}
    </div>
  );
}
