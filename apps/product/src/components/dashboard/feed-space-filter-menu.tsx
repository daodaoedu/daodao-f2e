"use client";

import { useTranslations } from "@daodao/i18n";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronDown } from "lucide-react";
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
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("feed_space_filter_trigger_aria_label", { label: triggerLabel })}
          className={cn(
            "inline-flex h-8 max-w-full cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm",
            isFiltered
              ? "border-primary-base bg-primary-base text-white"
              : "border-[#E4EAE9] bg-white text-text-dark/75"
          )}
        >
          <span className="min-w-0 truncate">{triggerLabel}</span>
          <ChevronDown className="size-[13px] shrink-0" strokeWidth={2} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={t("feed_space_filter_aria_label")}
        align="start"
        sideOffset={6}
        collisionPadding={16}
        className="flex max-h-[var(--radix-popover-content-available-height)] w-auto min-w-[220px] max-w-[calc(100vw-32px)] flex-col gap-0.5 overflow-y-auto rounded-2xl border-[#E4EAE9] bg-white p-1.5 shadow-[0_8px_20px_rgba(15,48,54,0.12)]"
      >
        <FilterRow
          label={t("feed_space_filter_all")}
          checked={!isFiltered}
          onToggle={() => onChange([])}
        />
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <FilterRow
              key={option.value}
              label={optionLabel(option)}
              checked={checked}
              disabled={!checked && selected.length >= MAX_SPACE_FILTERS}
              onToggle={() => onChange(toggleSpaceFilter(selected, option.value))}
            />
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function FilterRow({
  label,
  checked,
  disabled = false,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Checkbox（radix button）就在 label 內
    <label
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left text-sm text-text-dark hover:bg-[#F0F9F8]",
        checked && "bg-[#F0F9F8]",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
        className="size-4 rounded-[5px] border-[#D5E2E2] bg-white data-[state=checked]:border-primary-base data-[state=checked]:bg-primary-base [&_svg]:size-[11px] [&_svg_*]:[stroke-width:3.5]"
      />
      <span className="min-w-0 flex-1">{label}</span>
    </label>
  );
}
