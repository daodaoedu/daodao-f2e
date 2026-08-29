"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import type { InProgressTask } from "@/components/dashboard";
import { InProgressTaskCard } from "@/components/dashboard";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { applyMineFilter } from "@/utils/mine-filter";

const filterOptions = [
  { value: FilterStatus.all, labelKey: "filter_all" },
  { value: FilterStatus.inProgress, labelKey: "filter_in_progress" },
  { value: FilterStatus.draft, labelKey: "filter_draft" },
  { value: FilterStatus.notStarted, labelKey: "filter_not_started" },
  { value: FilterStatus.completed, labelKey: "filter_completed" },
] as const;

interface SpacePracticeSectionProps {
  tasks: InProgressTask[];
}

/**
 * Space sub-page practice list (FR-4.2/4.3): a fixed filter pill row that
 * filters client-side (default 進行中) and keeps an empty container with
 * explanatory text instead of hiding the list.
 */
export const SpacePracticeSection = ({ tasks }: SpacePracticeSectionProps) => {
  const t = useTranslations("space");
  const tDashboard = useTranslations("dashboard");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>(FilterStatus.inProgress);

  const filteredTasks = applyMineFilter(tasks, filterStatus);

  return (
    <div>
      <div
        role="tablist"
        aria-label={tDashboard("filter_aria_label")}
        className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide"
      >
        {filterOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            role="tab"
            aria-selected={filterStatus === option.value}
            onClick={() => setFilterStatus(option.value)}
            className={cn(
              "whitespace-nowrap rounded-full border px-5 py-2 text-sm transition-colors",
              filterStatus === option.value
                ? "border-primary-base bg-primary-base text-white"
                : "border-primary-base bg-white text-primary-base"
            )}
          >
            {tDashboard(option.labelKey)}
          </button>
        ))}
      </div>
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCEBEA] bg-white/60 px-6 py-14 text-center text-sm text-text-dark/50">
          {filterStatus === FilterStatus.inProgress ? t("empty_in_progress") : t("empty_list")}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTasks.map((task) => (
            <InProgressTaskCard key={task.id} {...task} />
          ))}
        </div>
      )}
    </div>
  );
};
