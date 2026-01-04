"use client";

import { TagSolidSvg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import {
  FREQUENCY_OPTIONS,
  type ManualPracticeFormValues,
} from "./manual/schema";

interface PracticeOverviewCardProps {
  actionDescription: ManualPracticeFormValues["actionDescription"];
  frequency: ManualPracticeFormValues["frequency"];
  durationMinutes: ManualPracticeFormValues["durationMinutes"];
  tags?: ManualPracticeFormValues["tags"];
}

export const PracticeOverviewCard = ({
  actionDescription,
  frequency,
  durationMinutes,
  tags,
}: PracticeOverviewCardProps) => {
  return (
    <div className="relative bg-white rounded-lg p-4 mb-4 shadow-sm">
      {/* Overview Text */}
      <p className="font-medium text-text-dark mb-3 pr-[88px]">
        {actionDescription}
      </p>

      {/* Time Commitments */}
      <div className="flex pb-3 mb-3 border-b border-bg-gray">
        <div className="w-20">
          <div className="text-xs text-text-dark">一週</div>
          <div className="flex items-baseline gap-0.5">
            <div className="text-lg font-medium text-logo-cyan">
              {FREQUENCY_OPTIONS.find((opt) => opt.value === frequency)?.label}
            </div>
            <div className="text-xs text-text-dark">天</div>
          </div>
        </div>
        <div className="w-20">
          <div className="text-xs text-text-dark">一次</div>
          <div className="flex items-baseline gap-0.5">
            <div className="text-lg font-medium text-logo-cyan">
              {durationMinutes}
            </div>
            <div className="text-xs text-text-dark">分鐘</div>
          </div>
        </div>
      </div>

      {/* Related Topics */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="very-light-blue"
              size="sm"
              className="text-sm py-[3px] rounded gap-1"
            >
              <TagSolidSvg
                width={18}
                height={18}
                className="text-light-cyan"
              />
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

