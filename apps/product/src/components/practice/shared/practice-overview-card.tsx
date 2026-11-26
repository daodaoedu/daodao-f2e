"use client";

import { DefaultAvatarSvg, TagSolidSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import type { ReactNode } from "react";
import { ReactionSection } from "@/components/social";
import type { ManualPracticeFormValues } from "../create/manual/schema";
import { CircularProgress } from "./circular-progress";

interface CreatorInfo {
  id: string;
  name: string;
  photoURL?: string | null;
  customId?: string | null;
  date?: string;
}

interface PracticeOverviewCardProps {
  actionDescription: ManualPracticeFormValues["actionDescription"];
  frequency: ManualPracticeFormValues["frequency"];
  durationMinutes: ManualPracticeFormValues["durationMinutes"];
  tags?: ManualPracticeFormValues["tags"];
  // 詳情頁專用屬性
  progress?: number;
  showProgress?: boolean;
  // 公開頁面顯示建立者資訊
  creator?: CreatorInfo;
  // 快速反應 + 留言（提供 practiceId 時顯示）
  practiceId?: string;
  // 卡片右上角的操作（例如行動版收合箭頭），與建立者資訊同列，不疊在進度環上
  headerAction?: ReactNode;
  // headerAction 只在行動版出現時，沒有建立者的桌機版不保留空白列
  headerActionMobileOnly?: boolean;
}

export const PracticeOverviewCard = ({
  actionDescription,
  frequency,
  durationMinutes,
  tags,
  progress,
  showProgress = false,
  creator,
  practiceId,
  headerAction,
  headerActionMobileOnly = false,
}: PracticeOverviewCardProps) => {
  const t = useTranslations("practice");
  return (
    <div className="relative bg-white pt-4 px-4 pb-4 mb-4 rounded-xl">
      {/* 建立者資訊 - 僅在公開頁面顯示 */}
      {(creator || headerAction) && (
        <div
          className={cn(
            "flex items-center gap-2 mb-3",
            !creator && headerActionMobileOnly && "md:hidden"
          )}
        >
          {creator && (
            <>
              <Link href={`/users/${creator.customId ?? creator.id}`}>
                <Avatar className="size-8">
                  {creator.photoURL && <AvatarImage src={creator.photoURL} />}
                  <AvatarFallback>
                    <DefaultAvatarSvg />
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Link
                href={`/users/${creator.customId ?? creator.id}`}
                className="text-sm font-medium text-text-dark hover:underline"
              >
                {creator.name}
              </Link>
              {creator.date && <span className="text-sm text-text-dark/60">{creator.date}</span>}
            </>
          )}
          {headerAction && <div className="ml-auto -my-2 -mr-2 shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className="relative flex items-start gap-4">
        {/* Overview Text */}
        <div className="flex-1">
          <p className="font-medium text-text-dark mb-3 pr-[88px]">{actionDescription}</p>

          {/* Time Commitments */}
          <div className="flex pb-3 mb-3 border-b border-bg-gray">
            <div className="w-20">
              <div className="text-xs text-text-dark">{t("overview_per_week")}</div>
              <div className="flex items-baseline gap-0.5">
                <div className="text-lg font-medium text-logo-cyan">{frequency}</div>
                <div className="text-xs text-text-dark">{t("overview_days_unit")}</div>
              </div>
            </div>
            <div className="w-20">
              <div className="text-xs text-text-dark">{t("overview_per_session")}</div>
              <div className="flex items-baseline gap-0.5">
                <div className="text-lg font-medium text-logo-cyan">{durationMinutes}</div>
                <div className="text-xs text-text-dark">{t("overview_minutes_unit")}</div>
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

      {/* 反應列 */}
      {practiceId !== undefined && <ReactionSection targetType="practice" targetId={practiceId} />}
    </div>
  );
};
