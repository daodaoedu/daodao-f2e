"use client";

import { ExpandableSearch } from "@daodao/ui/components/expandable-search";
import type { ReactNode } from "react";

interface ExploreToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchClearLabel: string;
  /** 篩選（FilterMenu） */
  children: ReactNode;
}

/** 探索頁「搜尋 + 篩選」列，版面同首頁動態牆（daodao#567） */
export function ExploreToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchClearLabel,
  children,
}: ExploreToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ExpandableSearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        clearLabel={searchClearLabel}
      />
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span aria-hidden="true" className="h-4 w-px bg-[oklch(0.891_0_89.9)]" />
        {children}
      </div>
    </div>
  );
}
