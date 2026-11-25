"use client";

import { useTranslations } from "@daodao/i18n";
import { FilterMenu, FilterMenuItem } from "@daodao/ui/components/filter-menu";
import {
  getSpaceFilterSummary,
  MAX_SPACE_FILTERS,
  type SpaceFilterOption,
  type SpaceFilterValue,
  toggleSpaceFilter,
} from "./feed-space-filter";

interface FeedSpaceFilterProps {
  options: SpaceFilterOption[];
  selected: SpaceFilterValue[];
  onChange: (next: SpaceFilterValue[]) => void;
}

/** 主頁動態牆的空間篩選（FRD FR-D3）：全部／個人實踐／共同挑戰／參與中的活動課程，可多選。 */
export function FeedSpaceFilter({ options, selected, onChange }: FeedSpaceFilterProps) {
  const t = useTranslations("dashboard");

  const optionLabel = (option: SpaceFilterOption) =>
    option.kind === "event_course"
      ? option.name
      : option.kind === "personal"
        ? t("feed_space_filter_personal")
        : t("feed_space_filter_challenge");

  const summary = getSpaceFilterSummary(selected, options);
  const triggerLabel =
    summary.type === "all"
      ? t("feed_space_filter_all")
      : summary.type === "single"
        ? optionLabel(summary.option)
        : t("feed_space_filter_selected_count", { count: summary.count });
  const isFiltered = summary.type !== "all";

  return (
    <FilterMenu
      label={triggerLabel}
      active={isFiltered}
      triggerAriaLabel={t("feed_space_filter_trigger_aria_label", { label: triggerLabel })}
      menuAriaLabel={t("feed_space_filter_aria_label")}
    >
      <FilterMenuItem
        label={t("feed_space_filter_all")}
        checked={!isFiltered}
        onToggle={() => onChange([])}
      />
      {options.map((option) => {
        const checked = selected.includes(option.value);
        return (
          <FilterMenuItem
            key={option.value}
            label={optionLabel(option)}
            checked={checked}
            disabled={!checked && selected.length >= MAX_SPACE_FILTERS}
            onToggle={() => onChange(toggleSpaceFilter(selected, option.value))}
          />
        );
      })}
    </FilterMenu>
  );
}
