"use client";

import { useMemo, useState } from "react";
import { cn } from "@daodao/ui/lib/utils";
import { Button } from "@daodao/ui/components/button";
import { CATEGORIES, SEARCH_TAGS, type ICategory } from "@/constants/resource";
import { useMediaQuery } from "@/hooks/resource/use-media-query";
import { getCategories } from "./utils";
import { CategoryCard } from "./category-card";
import { SectionTitle } from "./section-title";

interface CategoriesContainerProps {
  className?: string;
  size?: "sm" | "md";
  maxLength?: number;
  selectedCategories?: ICategory[];
  disabledCollapse?: boolean;
  categoryStats?: Record<string, number>;
}

export function CategoriesContainer({
  className,
  size = "md",
  maxLength = CATEGORIES.length,
  selectedCategories,
  disabledCollapse = false,
  categoryStats: _categoryStats,
}: CategoriesContainerProps) {
  const [isShowAll, setIsShowAll] = useState(false);
  const isMedium = useMediaQuery("isMedium");
  const isLarge = useMediaQuery("isLarge");

  const columnsClassNames = {
    sm: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
    md: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  const categories = getCategories(selectedCategories?.map((c) => c.value));
  const [majorCategory] = categories;
  const majorCategoryValue = majorCategory?.value;

  const hasSubCategories =
    Array.isArray(categories) &&
    selectedCategories &&
    majorCategoryValue !== undefined &&
    (SEARCH_TAGS[majorCategoryValue]?.length ?? 0) > 1;

  const categoryLength = Array.isArray(categories) ? categories.length : 0;

  const isEnableShowAllButton = categoryLength > 6 && !isLarge && !isMedium && !disabledCollapse;

  const categoriesWrapperStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!isEnableShowAllButton) {
      return undefined;
    }

    const rows = Math.ceil(categoryLength / 2);
    const categoryCardHeight = 60;
    const gap = 16;

    if (isShowAll) {
      return { maxHeight: rows * categoryCardHeight + gap * (rows - 1) };
    }
    return { maxHeight: 3 * categoryCardHeight + gap * 2 };
  }, [isEnableShowAllButton, isShowAll, categoryLength]);

  return (
    Array.isArray(categories) && (
      <div>
        {hasSubCategories && <SectionTitle title="子分類" />}
        <div
          className={cn(
            "grid gap-x-2 gap-y-4 md:gap-6",
            "transition-[max-height] overflow-hidden duration-300",
            columnsClassNames[size],
            className
          )}
          style={categoriesWrapperStyle}
        >
          {categories.slice(0, maxLength).map((category) => (
            <CategoryCard key={category.value} category={category} size={size} />
          ))}
        </div>
        {isEnableShowAllButton && (
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => setIsShowAll(!isShowAll)}
          >
            {isShowAll ? "收合" : "展開更多"}
          </Button>
        )}
      </div>
    )
  );
}
