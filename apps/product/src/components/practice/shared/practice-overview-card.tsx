"use client";

import { TagSolidSvg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import type { ManualPracticeFormValues } from "../create/manual/schema";
import { CircularProgress } from "./circular-progress";

interface PracticeOverviewCardProps {
  actionDescription: ManualPracticeFormValues["actionDescription"];
  frequency: ManualPracticeFormValues["frequency"];
  durationMinutes: ManualPracticeFormValues["durationMinutes"];
  tags?: ManualPracticeFormValues["tags"];
  // 詳情頁專用屬性
  progress?: number; // 進度值
  total?: number; // 總數（用於計算進度百分比）
  showProgress?: boolean; // 是否顯示進度條
}

export const PracticeOverviewCard = ({
  actionDescription,
  frequency,
  durationMinutes,
  tags,
  progress,
  total,
  showProgress = false,
}: PracticeOverviewCardProps) => {
  const progressPercentage =
    showProgress && total && total > 0 && progress !== undefined ? (progress / total) * 100 : 0;

  return (
    <div className="relative bg-white rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Overview Text */}
        <div className="flex-1">
          <p className="font-medium text-text-dark mb-3 pr-[88px]">{actionDescription}</p>

          {/* Time Commitments */}
          <div className="flex pb-3 mb-3 border-b border-bg-gray">
            <div className="w-20">
              <div className="text-xs text-text-dark">一週</div>
              <div className="flex items-baseline gap-0.5">
                <div className="text-lg font-medium text-logo-cyan">{frequency}</div>
                <div className="text-xs text-text-dark">天</div>
              </div>
            </div>
            <div className="w-20">
              <div className="text-xs text-text-dark">一次</div>
              <div className="flex items-baseline gap-0.5">
                <div className="text-lg font-medium text-logo-cyan">{durationMinutes}</div>
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
                  <TagSolidSvg width={18} height={18} className="text-light-cyan" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Circular Progress - 僅在詳情頁顯示 */}
        {showProgress && (
          <div className="absolute right-4 top-4">
            <CircularProgress value={progressPercentage} />
          </div>
        )}
      </div>
    </div>
  );
};
