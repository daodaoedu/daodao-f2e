"use client";

import { useTranslations } from "@daodao/i18n";
import { FilterMenu, FilterMenuItem } from "@daodao/ui/components/filter-menu";
import { cn } from "@daodao/ui/lib/utils";
import { Sprout } from "lucide-react";
import { useState } from "react";
import type { InProgressTask } from "@/components/dashboard";
import { InProgressTaskCard } from "@/components/dashboard";
import { ExploreEmpty } from "@/components/explore/explore-empty";
import { ExploreSectionHeader } from "@/components/explore/explore-section";
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
  presentation?: "default" | "personal-space";
  /** 有值時在篩選下方顯示分區標題（圖示＋標題＋「· n」） */
  sectionTitle?: string;
}

/**
 * Space sub-page practice list (FR-4.2/4.3): a single-select dropdown filter
 * (same FilterMenu as the home feed and explore pages, daodao#572) that
 * filters client-side (default 進行中) and keeps an empty container with
 * explanatory text instead of hiding the list.
 */
export const SpacePracticeSection = ({
  tasks,
  presentation = "default",
  sectionTitle,
}: SpacePracticeSectionProps) => {
  const t = useTranslations("space");
  const tDashboard = useTranslations("dashboard");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>(FilterStatus.inProgress);

  const filteredTasks = applyMineFilter(tasks, filterStatus);
  const currentOption =
    filterOptions.find((option) => option.value === filterStatus) ?? filterOptions[0];
  const triggerLabel = tDashboard(currentOption.labelKey);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <FilterMenu
          label={triggerLabel}
          active={filterStatus !== FilterStatus.all}
          triggerAriaLabel={t("filter_trigger_aria_label", { label: triggerLabel })}
          menuAriaLabel={t("practice_filter_menu_aria_label")}
        >
          {filterOptions.map((option) => (
            <FilterMenuItem
              key={option.value}
              label={tDashboard(option.labelKey)}
              checked={filterStatus === option.value}
              onToggle={() => setFilterStatus(option.value)}
            />
          ))}
        </FilterMenu>
      </div>
      <section>
        {sectionTitle && (
          <div className="mb-5">
            <ExploreSectionHeader title={sectionTitle} count={filteredTasks.length} Icon={Sprout} />
          </div>
        )}
        {filteredTasks.length === 0 ? (
          <ExploreEmpty
            title={
              filterStatus === FilterStatus.inProgress ? t("empty_in_progress") : t("empty_list")
            }
          />
        ) : (
          <div
            className={cn(
              presentation === "personal-space"
                ? "grid grid-cols-1 gap-4 md:grid-cols-2"
                : "flex flex-col gap-3"
            )}
          >
            {filteredTasks.map((task) => (
              <InProgressTaskCard key={task.id} {...task} presentation={presentation} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
