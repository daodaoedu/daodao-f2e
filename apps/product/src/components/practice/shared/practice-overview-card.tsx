"use client";

import { DefaultAvatarSvg, TagSolidSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import { ReactionSection } from "@/components/social";
import { EXECUTION_TIMING_OPTIONS, type ManualPracticeFormValues } from "../create/manual/schema";
import { CircularProgress } from "./circular-progress";
import { PracticePeriodSummary } from "./practice-period-summary";

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
  schedule?: {
    startDate?: string | null;
    durationDays: number | null;
    executionTiming: ManualPracticeFormValues["executionTiming"];
    customTiming?: string;
  };
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
  schedule,
}: PracticeOverviewCardProps) => {
  const t = useTranslations("practice");
  const timingLabels = (schedule?.executionTiming ?? []).flatMap((timing) => {
    const option = EXECUTION_TIMING_OPTIONS.find(({ value }) => value === timing);
    return option ? [t(option.labelKey)] : [];
  });
  if (schedule?.customTiming) timingLabels.push(schedule.customTiming);

  return (
    <div
      className={cn(
        "relative bg-white pt-4 px-4 pb-4 mb-4 rounded-xl",
        schedule && "mb-0 bg-very-light-blue sm:p-5"
      )}
    >
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
          {creator.date && <span className="text-sm text-text-dark/60">{creator.date}</span>}
        </div>
      )}
      <div className="relative flex items-start gap-4">
        {/* Overview Text */}
        <div className="flex-1">
          <div className={cn(schedule && "min-h-20")}>
            <p className="font-medium text-text-dark mb-3 pr-[88px]">{actionDescription}</p>
          </div>

          {schedule && (
            <PracticePeriodSummary
              startDate={schedule.startDate}
              durationDays={schedule.durationDays}
            />
          )}

          {/* Time Commitments */}
          <dl
            className={cn(
              "flex pb-3 mb-3 border-b border-bg-gray",
              schedule && "grid grid-cols-[1fr_1fr_2fr] gap-3"
            )}
          >
            <div className={schedule ? "min-w-0" : "w-20"}>
              <dt className="text-xs text-text-dark">{t("overview_per_week")}</dt>
              <dd className="flex flex-wrap items-baseline gap-x-0.5">
                <div className="whitespace-nowrap text-lg font-medium text-logo-cyan">
                  {frequency}
                </div>
                <div className="whitespace-nowrap text-xs text-text-dark">
                  {t("overview_days_unit")}
                </div>
              </dd>
            </div>
            <div className={schedule ? "min-w-0" : "w-20"}>
              <dt className="text-xs text-text-dark">{t("overview_per_session")}</dt>
              <dd className="flex flex-wrap items-baseline gap-x-0.5">
                <div className="whitespace-nowrap text-lg font-medium text-logo-cyan">
                  {durationMinutes}
                </div>
                <div className="whitespace-nowrap text-xs text-text-dark">
                  {t("overview_minutes_unit")}
                </div>
              </dd>
            </div>
            {schedule && (
              <div className="min-w-0">
                <dt className="text-xs text-text-dark">{t("form_execution_timing")}</dt>
                <dd className="break-words text-lg font-medium text-logo-cyan">
                  {timingLabels.length > 0 ? timingLabels.join(" · ") : t("timing_unset")}
                </dd>
              </div>
            )}
          </dl>

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
