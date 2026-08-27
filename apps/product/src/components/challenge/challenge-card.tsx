"use client";

import type { ChallengeSummaryType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Badge, type BadgeProps } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Calendar, Flag, Timer, Users } from "lucide-react";
import { PracticeTheme, practiceThemeSvgMap } from "@/constants/practice-theme";
import { calculateDaysProgress, formatCardDate } from "@/utils/practice-card";

interface ChallengeCardProps {
  challenge: ChallengeSummaryType;
  /** 點擊「現在加入」；未登入時由外層導向登入 */
  onJoinClick: (challenge: ChallengeSummaryType) => void;
}

/** 卡片背景主題：依 id 輪替，讓探索頁有變化又保持穩定 */
const THEME_ROTATION = [
  PracticeTheme.yellow,
  PracticeTheme.blue,
  PracticeTheme.pink,
  PracticeTheme.green,
] as const;

const STATUS_BADGE: Record<ChallengeSummaryType["runStatus"], BadgeProps["variant"]> = {
  upcoming: "very-light-blue",
  ongoing: "default",
  ended: "outline-logo",
};

/**
 * 共同挑戰卡片（探索共同挑戰頁）
 *
 * 樣式對齊 dashboard 的 InProgressTaskCard（POC：探索共同挑戰-standalone）：
 * 主題色背景 + 狀態 Badge + 挑戰旗標 + 「xx 座島」人數文案隨狀態變化。
 */
export const ChallengeCard = ({ challenge, onJoinClick }: ChallengeCardProps) => {
  const t = useTranslations("challenge");
  const themeName = THEME_ROTATION[challenge.id % THEME_ROTATION.length] ?? PracticeTheme.yellow;
  const Theme = practiceThemeSvgMap[themeName] ?? practiceThemeSvgMap[PracticeTheme.yellow];
  const formattedStartDate = formatCardDate(challenge.startDate);
  const daysProgress = calculateDaysProgress(challenge.startDate, challenge.endDate);

  const participantsLabel =
    challenge.runStatus === "ended"
      ? t("participants_ended", { count: challenge.participantCount })
      : challenge.runStatus === "ongoing"
        ? t("participants_ongoing", { count: challenge.participantCount })
        : t("participants_upcoming", { count: challenge.participantCount });

  const showJoinButton = !challenge.isJoined && challenge.runStatus !== "ended";
  const joinDisabled = !challenge.canJoin;
  const joinLabel = challenge.canJoin
    ? t("cta_join")
    : challenge.unavailableReason === "full"
      ? t("cta_full")
      : t("cta_closed");

  return (
    <div className="relative w-full h-[239px] rounded-[12px] overflow-hidden text-left">
      <Theme
        className="absolute inset-0 w-full h-full rounded-[12px]"
        preserveAspectRatio="xMidYMid slice"
      />

      <div className="absolute inset-0 p-5 pb-4 z-10 flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Badge variant={STATUS_BADGE[challenge.runStatus]} size="sm" className="w-fit">
              {t(`status_${challenge.runStatus}`)}
            </Badge>
            <span
              role="img"
              aria-label={t("challenge_tag")}
              title={t("challenge_tag")}
              className="inline-flex items-center justify-center size-6 rounded-full border border-logo-cyan bg-light-blue"
            >
              <Flag className="size-3.5 text-text-dark/75" />
            </span>
            {challenge.isJoined && (
              <Badge variant="outline-logo" size="sm" className="w-fit">
                {t("cta_joined")}
              </Badge>
            )}
          </div>

          <h3 className="line-clamp-1 text-xl font-medium text-bg-dark">{challenge.displayName}</h3>
          {challenge.description && (
            <p className="line-clamp-2 text-xs text-text-dark">{challenge.description}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-text-dark">
            {formattedStartDate !== null && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5 shrink-0" />
                {t("card_start_date", { date: formattedStartDate })}
              </span>
            )}
            {daysProgress !== null && (
              <span className="flex items-center gap-1">
                <Timer className="size-3.5 shrink-0" />
                {t("card_days_progress", {
                  current: daysProgress.elapsed,
                  total: daysProgress.total,
                })}
              </span>
            )}
          </div>

          <span className="flex items-center gap-1 text-xs text-text-dark">
            <Users className="size-3.5 shrink-0" />
            {participantsLabel}
          </span>
        </div>

        {showJoinButton && (
          <span className="mt-3 shrink-0 block">
            <Button
              variant="secondary"
              className="w-full sm:max-w-[288px]"
              disabled={joinDisabled}
              onClick={() => onJoinClick(challenge)}
            >
              {joinLabel}
            </Button>
          </span>
        )}
      </div>
    </div>
  );
};
