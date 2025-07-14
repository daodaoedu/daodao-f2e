import { useMemo, useState } from "react";
import { CATEGORIES, ICategory, SEARCH_TAGS } from "@/constants/category";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import CategoryCard from "./CategoryCard";
import SectionTitle from "./SectionTitle";
import { getCategories } from "../utils";

interface CategoriesContainerProps {
  className?: string;
  size?: "sm" | "md";
  maxLength?: number;
  selectedCategories?: ICategory[];
  disabledCollapse?: boolean;
}

export default function CategoriesContainer({
  className,
  size = "md",
  maxLength = CATEGORIES.length,
  selectedCategories,
  disabledCollapse = false,
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

  const hasSubCategories =
    Array.isArray(categories) &&
    selectedCategories &&
    SEARCH_TAGS[majorCategory?.value]?.length > 1;

  const categoryLength = Array.isArray(categories) ? categories.length : 0;

  const isEnableShowAllButton =
    categoryLength > 6 && !isLarge && !isMedium && !disabledCollapse;

  const categoriesWrapperStyle = useMemo<
    React.CSSProperties | undefined
  >(() => {
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
  }, [isEnableShowAllButton, isShowAll, categoryLength, disabledCollapse]);

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
            <CategoryCard
              key={category.value}
              category={category}
              size={size}
            />
          ))}
        </div>
        {isEnableShowAllButton && (
          <Button
            variant="outline"
            color="primary"
            className="w-full mt-3"
            onClick={() => setIsShowAll(!isShowAll)}
          >
            {isShowAll ? "收合" : "展開更多"}
          </Button>
        )}
      </div>
    )
  );
}
