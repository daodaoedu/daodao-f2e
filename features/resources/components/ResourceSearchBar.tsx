import { useEffect, useRef, useState } from "react";
import {
  SearchIcon,
  SlidersHorizontalIcon,
  ChartNoAxesColumnDecreasingIcon,
  SendHorizontalIcon,
} from "lucide-react";
import useShadowToggleOnScroll from "@/hooks/useShadowToggleOnScroll";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResourceSearchParamsSchema } from "@/services/resources/core/schema";
import { Container } from "@/components/ui/wrapper";
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
  const isReady = useRef(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { height, isShowShadow, TriggerElement } = useShadowToggleOnScroll();

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  useEffect(() => {
    if (query !== prevQueryRef.current) {
      onFilter({ query });
    }
    prevQueryRef.current = query;
  }, [query, onFilter]);

  useEffect(() => {
    if (!isReady.current && (filters?.query || query)) {
      setQuery(filters?.query ?? "");
      isReady.current = true;
    }
  }, [filters?.query, query]);

  return (
    <>
      <TriggerElement />
      <div
        className={cn(
          "sticky z-20 bg-basic-white py-5 gap-6 md:py-6",
          isShowShadow && "shadow-md shadow-basic-black/10"
        )}
        style={{ top: `${height}px` }}
      >
        <Container className="flex justify-between flex-col gap-4 md:flex-row">
          <Input
            prefixIcon={<SearchIcon />}
            suffixIcon={(v) => v.length > 0 && <SendHorizontalIcon />}
            className="md:w-1/2"
            defaultValue={query}
            onSuffixIconClick={setQuery}
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
        </Container>
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
