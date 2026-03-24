"use client";

import type { CategoryType, ICategory } from "../types";

interface CategoryStarProps {
  category: ICategory;
  isSelected: boolean;
  onSelect: (id: CategoryType) => void;
}

export function CategoryStar({ category, isSelected, onSelect }: CategoryStarProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className="flex h-[220px] w-[180px] flex-shrink-0 snap-center flex-col items-center justify-center gap-2"
    >
      <category.icon
        width={isSelected ? 180 : 104}
        height={isSelected ? 180 : 104}
        className={`transition-all duration-300 ${isSelected ? "opacity-100" : "opacity-30"}`}
      />
      {isSelected && (
        <span className="rounded-full bg-white/20 px-5 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          {category.label}
        </span>
      )}
    </button>
  );
}
