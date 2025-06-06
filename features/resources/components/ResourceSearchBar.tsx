import { useCallback, useRef, useState } from "react";
import LensIcon from "@/public/assets/icons/lens.svg";
import useShadowToggleOnScroll from "@/hooks/useShadowToggleOnScroll";
import { cn } from "@/utils/cn";
import { Button } from "@/components/atoms/button";
import useSearchParamsManager from "@/hooks/useSearchParamsManager";
import useDebounce from "@/hooks/useDebounce";
import ResourceSearchModal from "./ResourceSearchModal";

interface FilterState {
  resourceTypes: string[];
  feeTypes: string[];
  levelTypes: string[];
  durationTypes: string[];
}

export default function ResourceSearchBar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { height, isShowShadow, TriggerElement } = useShadowToggleOnScroll();
  const [getSearchParams, pushState] = useSearchParamsManager();
  const searchParams = getSearchParams();

  const updateSearchQuery = useCallback(
    (value: string) => {
      pushState("q", value);
    },
    [pushState]
  );

  const debouncedUpdateSearch = useDebounce(updateSearchQuery, 500);

  const inputRef = useRef<HTMLInputElement>(null);

  const onClickFocus = () => {
    inputRef.current?.focus();
  };

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleFilter = (filters: FilterState) => {
    if (filters.resourceTypes.length > 0) {
      pushState("resourceTypes", filters.resourceTypes.join(","));
    } else {
      pushState("resourceTypes", "");
    }

    if (filters.feeTypes.length > 0) {
      pushState("feeTypes", filters.feeTypes.join(","));
    } else {
      pushState("feeTypes", "");
    }

    if (filters.levelTypes.length > 0) {
      pushState("levelTypes", filters.levelTypes.join(","));
    } else {
      pushState("levelTypes", "");
    }

    if (filters.durationTypes.length > 0) {
      pushState("durationTypes", filters.durationTypes.join(","));
    } else {
      pushState("durationTypes", "");
    }
  };

  // 從 URL 參數中解析當前的篩選狀態
  const initialFilters: FilterState = {
    resourceTypes: searchParams.resourceTypes ? searchParams.resourceTypes.split(",") : [],
    feeTypes: searchParams.feeTypes ? searchParams.feeTypes.split(",") : [],
    levelTypes: searchParams.levelTypes ? searchParams.levelTypes.split(",") : [],
    durationTypes: searchParams.durationTypes ? searchParams.durationTypes.split(",") : []
  };

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
        <div className="basis-1/2 relative">
          <LensIcon
            className="absolute top-[0.625rem] left-4"
            onClick={onClickFocus}
          />
          <input
            ref={inputRef}
            type="search"
            placeholder="想找什麼資源..."
            className="h-10 w-full rounded-lg border-[#DBDBDB] border flex items-center justify-center p-[0_1rem_0_2.75rem]"
            onChange={(e) => debouncedUpdateSearch(e.target.value)}
            defaultValue={searchParams.q || ""}
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            color="primary"
            onClick={handleOpenFilter}
          >
            篩選
          </Button>
          <Button variant="outline" size="sm" color="primary">
            最熱門
          </Button>
        </div>
      </div>

      <ResourceSearchModal
        open={isFilterOpen}
        onClose={handleCloseFilter}
        onFilter={handleFilter}
        initialFilters={initialFilters}
      />
    </>
  );
}
