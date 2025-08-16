import { Dispatch, SetStateAction, useState } from 'react';
import {
  SearchIcon,
  SlidersHorizontalIcon,
  ChartNoAxesColumnDecreasingIcon,
  SendHorizontalIcon,
} from 'lucide-react';
import useShadowToggleOnScroll from '@/hooks/useShadowToggleOnScroll';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResourceSearchParamsSchema } from '@/services/resources/core/schema';
import { Container } from '@/components/ui/wrapper';
import ResourceSearchModal from './ResourceSearchModal';

interface ResourceSearchBarProps {
  filters?: ResourceSearchParamsSchema;
  onFilter: Dispatch<SetStateAction<ResourceSearchParamsSchema>>;
}

export default function ResourceSearchBar({
  filters,
  onFilter,
}: ResourceSearchBarProps) {
  const defaultQuery = filters?.query ?? '';
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { height, isShowShadow, TriggerElement } = useShadowToggleOnScroll();

  const handleFilterChange = (filter: ResourceSearchParamsSchema) => {
    onFilter((prev) => ({ ...prev, ...filter }));
  };

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleFilterChange({ query: e.currentTarget.value });
    }
  };

  return (
    <>
      <div className="sticky z-20" style={{ top: `${height}px` }}>
        <TriggerElement />
        <div
          className={cn(
            'bg-basic-white py-5 gap-6 md:py-6',
            isShowShadow && 'shadow-md shadow-basic-black/10'
          )}
        >
          <Container className="flex flex-col justify-between gap-4 md:flex-row">
            <Input
              type="search"
              prefixIcon={<SearchIcon />}
              suffixIcon={(v) => (v.length > 0 || defaultQuery.length > 0) && (
              <SendHorizontalIcon />
              )}
              className="md:w-1/2"
              defaultValue={defaultQuery}
              onKeyDown={handleKeyDown}
              onSuffixIconClick={(value) => handleFilterChange({ query: value })}
              placeholder="想找什麼資源..."
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="lg"
                color="primary"
                onClick={handleOpenFilter}
              >
                <SlidersHorizontalIcon className="size-4 text-primary-base" />
                篩選
              </Button>
              <Button variant="outline" size="lg" color="primary">
                <ChartNoAxesColumnDecreasingIcon className="size-4 rotate-90 text-primary-base" />
                最熱門
              </Button>
            </div>
          </Container>
        </div>
      </div>

      <ResourceSearchModal
        open={isFilterOpen}
        onClose={handleCloseFilter}
        onFilter={handleFilterChange}
        filters={filters}
      />
    </>
  );
}
