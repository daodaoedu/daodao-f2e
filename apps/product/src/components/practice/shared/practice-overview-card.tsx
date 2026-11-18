"use client";

import { DefaultAvatarSvg, TagSolidSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { ReactionSection } from "@/components/social";
import { EXECUTION_TIMING_OPTIONS, type ManualPracticeFormValues } from "../create/manual/schema";
import { CircularProgress } from "./circular-progress";
import { PracticeScheduleCard } from "./practice-schedule-card";

interface CreatorInfo {
  id: string;
  name: string;
  photoURL?: string | null;
  customId?: string | null;
}

interface PracticeOverviewCardProps {
  actionDescription: ManualPracticeFormValues["actionDescription"];
  frequency: ManualPracticeFormValues["frequency"];
  durationMinutes: ManualPracticeFormValues["durationMinutes"];
  tags?: ManualPracticeFormValues["tags"];
  executionTiming?: ManualPracticeFormValues["executionTiming"];
  customTiming?: ManualPracticeFormValues["customTiming"];
  durationDays?: number | null;
  startDate?: string | null;
  // 詳情頁專用屬性
  progress?: number;
  showProgress?: boolean;
  // 公開頁面顯示建立者資訊
  creator?: CreatorInfo;
  // 快速反應 + 留言（提供 practiceId 時顯示）
  practiceId?: string;
}

export const PracticeOverviewCard = ({
  actionDescription,
  frequency,
  durationMinutes,
  tags,
  executionTiming,
  customTiming,
  durationDays,
  startDate,
  progress,
  showProgress = false,
  creator,
  practiceId,
}: PracticeOverviewCardProps) => {
  const t = useTranslations("practice");
  const executionTimingLabels = [
    ...(executionTiming ?? []).flatMap((timing) => {
      const option = EXECUTION_TIMING_OPTIONS.find((item) => item.value === timing);
      return option ? [t(option.labelKey)] : [];
    }),
    ...(customTiming ? [customTiming] : []),
  ];
  return (
    <div className="relative bg-white pt-4 px-4 pb-4 mb-4 rounded-xl">
      {/* 建立者資訊 - 僅在公開頁面顯示 */}
      {creator && (
        <div className="flex items-center gap-2 mb-3">
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
        </div>
      )}
      <div>
        <div className="mb-3 flex items-start gap-3">
          <p className="min-w-0 flex-1 font-medium text-text-dark">{actionDescription}</p>
          {/* Circular Progress - 僅在詳情頁顯示 */}
          {showProgress && typeof progress === "number" && (
            <CircularProgress
              value={progress}
              className="shrink-0"
              ariaLabel={t("completion_rate_aria", { value: Math.round(progress) })}
            />
          )}
        </div>

        {durationDays !== undefined && durationDays !== null && (
          <div className="mb-3 pt-2">
            <PracticeScheduleCard durationDays={durationDays} startDate={startDate ?? null} />
          </div>
        )}

        <div>
          {/* Time Commitments */}
          <div className="flex gap-3 pb-3 mb-3 border-b border-bg-gray pl-2">
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
            {executionTimingLabels.length > 0 && (
              <div className="min-w-0 flex-1">
                <div className="text-xs text-text-dark">{t("form_execution_timing")}</div>
                <div className="flex flex-wrap items-baseline gap-x-1 text-lg font-medium leading-7 text-logo-cyan">
                  {executionTimingLabels.map((label, index) => (
                    <span key={`${label}-${index}`}>
                      {index > 0 && <span aria-hidden="true">、</span>}
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
      </div>

      {/* 反應列 */}
      {practiceId !== undefined && <ReactionSection targetType="practice" targetId={practiceId} />}
    </div>
  );
};
