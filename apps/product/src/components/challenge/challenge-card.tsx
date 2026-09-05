"use client";

import type { ChallengeSummaryType } from "@daodao/api";
import { ArrowRightOutlineSvg, DefaultAvatarSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Badge, type BadgeProps } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Calendar, Flag, Sparkles, Timer, Users } from "lucide-react";
import { PracticeTheme, practiceThemeSvgMap } from "@/constants/practice-theme";
import { calculateDaysProgress, formatCardDate } from "@/utils/practice-card";

interface ChallengeCardProps {
  challenge: ChallengeSummaryType;
  /** 點擊「現在加入」；未登入時由外層導向登入 */
  onJoinClick: (challenge: ChallengeSummaryType) => void;
  /** 點擊抽卡 icon（有指派卡組且已加入時顯示） */
  onDrawClick?: (challenge: ChallengeSummaryType) => void;
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
export const ChallengeCard = ({ challenge, onJoinClick, onDrawClick }: ChallengeCardProps) => {
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

      <div className="absolute inset-0 p-5 pb-6 z-10 flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col gap-1.5">
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
            {challenge.hasInspirationDeck &&
              challenge.isJoined &&
              challenge.runStatus !== "ended" &&
              onDrawClick && (
                <button
                  type="button"
                  aria-label={t("draw_entry_label")}
                  title={t("draw_entry_label")}
                  className="ml-auto inline-flex size-7 cursor-pointer items-center justify-center rounded-full border border-logo-cyan bg-basic-white/80 transition-colors hover:bg-light-blue"
                  onClick={() => onDrawClick(challenge)}
                >
                  <Sparkles className="size-4 text-logo-cyan" />
                </button>
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

          <span className="flex items-center gap-2 text-xs text-text-dark">
            {challenge.participantCount > 0 ? (
              <span className="flex shrink-0 items-center">
                {Array.from({ length: Math.min(3, challenge.participantCount) }).map((_, index) => (
                  <DefaultAvatarSvg
                    key={index}
                    className={`size-5 rounded-full shadow-[0_0_0_2px_white] ${index > 0 ? "-ml-1.75" : ""}`}
                  />
                ))}
              </span>
            ) : (
              <Users className="size-3.5 shrink-0" />
            )}
            {participantsLabel}
          </span>
        </div>

        {showJoinButton && (
          <span className="mt-2 shrink-0 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              disabled={joinDisabled}
              onClick={() => onJoinClick(challenge)}
            >
              {joinLabel}
              <ArrowRightOutlineSvg className="size-3.5 opacity-70" />
            </Button>
          </span>
        )}
      </div>

      {daysProgress !== null && (
        <div className="absolute right-5 bottom-1.5 left-5 z-10">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/75 shadow-[inset_0_0_0_1px_rgba(15,48,54,0.08)]">
            <div
              className="h-full bg-logo-cyan"
              style={{ width: `${Math.round((daysProgress.elapsed / daysProgress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
