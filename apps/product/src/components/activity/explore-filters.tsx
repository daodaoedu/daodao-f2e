"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import {
  ACTIVITY_STATUS_FILTERS,
  type ActivityFeeFilter,
  type ActivityStatusFilter,
} from "@/constants/activity-filter";

interface ExploreFiltersProps {
  statusFilter: ActivityStatusFilter;
  onStatusChange: (f: ActivityStatusFilter) => void;
  feeFilter: ActivityFeeFilter;
  onFeeChange: (f: ActivityFeeFilter) => void;
}

const FEE_OPTIONS: ("free" | "paid")[] = ["free", "paid"];

const pillBase =
  "h-[30px] cursor-pointer rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors";
const pillOn = "border-logo-cyan bg-logo-cyan text-white";
const pillOff = "border-[#DCEBEA] bg-white text-text-dark/75 hover:border-logo-cyan/50";

export const ExploreFilters = ({
  statusFilter,
  onStatusChange,
  feeFilter,
  onFeeChange,
}: ExploreFiltersProps) => {
  const t = useTranslations("explore_activities");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ACTIVITY_STATUS_FILTERS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onStatusChange(key)}
          className={cn(pillBase, statusFilter === key ? pillOn : pillOff)}
        >
          {t(`filter_${key}`)}
        </button>
      ))}

      <div className="mx-0.5 h-[18px] w-px bg-[#D4E5E4]" />

      {FEE_OPTIONS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onFeeChange(feeFilter === key ? null : key)}
          className={cn(pillBase, feeFilter === key ? pillOn : pillOff)}
        >
          {t(`filter_${key}`)}
        </button>
      ))}
    </div>
  );
};
