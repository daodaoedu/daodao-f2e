import { useEffect, useRef, useState } from "react";
import {
  SlidersHorizontalIcon,
  ChartNoAxesColumnDecreasingIcon,
} from "lucide-react";
import useShadowToggleOnScroll from "@/hooks/useShadowToggleOnScroll";
import { cn } from "@/utils/cn";
import { Button } from "@/components/atoms/button";
import SearchInput from "@/components/molecules/search-input";
import useDebounce from "@/hooks/useDebounce";
import { ResourceSearchParamsSchema } from "@/services/resources/core/schema";
import ResourceSearchModal from "./ResourceSearchModal";

interface ResourceSearchBarProps {
  filters?: ResourceSearchParamsSchema;
  onFilter: (filter: ResourceSearchParamsSchema) => void;
}

export default function ResourceSearchBar({
  filters,
  onFilter,
}: ResourceSearchBarProps) {
  const [query, setQuery] = useState(filters?.query ?? "");
  const prevQueryRef = useRef(query);
  const prevFiltersQueryRef = useRef(filters?.query);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { height, isShowShadow, TriggerElement } = useShadowToggleOnScroll();

  const debouncedUpdateSearch = useDebounce(onFilter, 500);

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  useEffect(() => {
    if (query !== prevQueryRef.current) {
      debouncedUpdateSearch({ query });
    }
    prevQueryRef.current = query;
  }, [query, debouncedUpdateSearch]);

  useEffect(() => {
    if (
      filters?.query !== prevFiltersQueryRef.current &&
      filters?.query !== query
    ) {
      setQuery(filters?.query ?? "");
    }
    prevFiltersQueryRef.current = filters?.query;
  }, [query, filters?.query]);

  return (
    <>
      <TriggerElement />
      <div
        className={cn(
          "sticky z-20 flex justify-between bg-basic-white py-5 px-5 gap-6 flex-col md:flex-row md:py-6 md:px-24",
          isShowShadow && "shadow-md shadow-basic-black/10"
        )}
        style={{ top: `${height}px` }}
      >
        <SearchInput
          className="w-1/2"
          // value={query}
          // onChange={setQuery}
          placeholder="想找什麼資源..."
        />
        <div className="flex gap-3 justify-end">
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
      </div>

      <ResourceSearchModal
        open={isFilterOpen}
        onClose={handleCloseFilter}
        onFilter={onFilter}
        filters={filters}
      />
    </>
  );
}
