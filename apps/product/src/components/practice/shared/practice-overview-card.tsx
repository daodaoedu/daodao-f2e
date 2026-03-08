"use client";

import { DefaultAvatarSvg, TagSolidSvg } from "@daodao/assets";
import { Link } from "@daodao/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import type { ManualPracticeFormValues } from "../create/manual/schema";
import { CircularProgress } from "./circular-progress";

interface CreatorInfo {
  id: string;
  name: string;
  photoURL?: string | null;
  date?: string;
}

interface PracticeOverviewCardProps {
  actionDescription: ManualPracticeFormValues["actionDescription"];
  frequency: ManualPracticeFormValues["frequency"];
  durationMinutes: ManualPracticeFormValues["durationMinutes"];
  tags?: ManualPracticeFormValues["tags"];
  // 詳情頁專用屬性
  progress?: number; // 進度值
  showProgress?: boolean; // 是否顯示進度條
  // 公開頁面顯示建立者資訊
  creator?: CreatorInfo;
  /** 覆蓋根元素的 className（用於嵌入更大卡片時移除自帶的 shadow/rounded） */
  className?: string;
}

export const PracticeOverviewCard = ({
  actionDescription,
  frequency,
  durationMinutes,
  tags,
  progress,
  showProgress = false,
  creator,
  className,
}: PracticeOverviewCardProps) => {
  return (
    <div className={cn("relative bg-white rounded-lg p-4 mb-4 shadow-sm", className)}>
      {/* 建立者資訊 - 僅在公開頁面顯示 */}
      {creator && (
        <div className="flex items-center gap-2 mb-3">
          <Link href={`/users/${creator.id}`}>
            <Avatar className="size-8">
              {creator.photoURL && <AvatarImage src={creator.photoURL} />}
              <AvatarFallback>
                <DefaultAvatarSvg />
              </AvatarFallback>
            </Avatar>
          </Link>
          <Link
            href={`/users/${creator.id}`}
            className="text-sm font-medium text-text-dark hover:underline"
          >
            {creator.name}
          </Link>
          {creator.date && (
            <span className="text-sm text-text-dark/60">{creator.date}</span>
          )}
        </div>
      )}
      <div className="relative flex items-start gap-4">
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
        {showProgress && typeof progress === "number" && (
          <div className="absolute right-0 top-0">
            <CircularProgress value={progress} />
          </div>
        )}
      </div>
    </div>
  );
};
