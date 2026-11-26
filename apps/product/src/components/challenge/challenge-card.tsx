"use client";

import type { ChallengeSummaryType } from "@daodao/api";
import { ArrowRightOutlineSvg, DefaultAvatarSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Calendar, CalendarCheck, Check, Timer, Users } from "lucide-react";
import {
  ChallengeFlagIcon,
  ChallengeProgressBar,
  getChallengeThemeSvg,
  InspirationDeckIcon,
} from "@/components/challenge/challenge-visual";
import {
  type ExploreBadgeTone,
  ExploreStatusBadge,
} from "@/components/explore/explore-status-badge";
import {
  getChallengeCardAction,
  getChallengeStatusKey,
  isChallengeActionMuted,
} from "@/utils/challenge-card";
import { calculateDaysProgress, formatCardDate } from "@/utils/practice-card";

/** 狀態標籤色調與探索活動課程卡一致（daodao#567） */
const STATUS_TONE: Record<ChallengeSummaryType["runStatus"], ExploreBadgeTone> = {
  upcoming: "neutral",
  ongoing: "active",
  ended: "muted",
};

interface ChallengeCardProps {
  challenge: ChallengeSummaryType;
  /** 點擊「現在加入」；未登入時由外層導向登入 */
  onJoinClick: (challenge: ChallengeSummaryType) => void;
  /** 點擊抽卡 icon（有指派卡組且已加入時顯示） */
  onDrawClick?: (challenge: ChallengeSummaryType) => void;
  /**
   * 加入時自動複製的實踐 external_id。已加入且進行中／已結束時，整張卡連到該實踐頁
   * （POC：點卡片進實踐頁打卡）；未知時卡片不可點。
   */
  practiceId?: string | null;
  /**
   * 整張卡的連結（探索共同挑戰頁傳介紹頁，daodao#570）。不傳時沿用動作連結：
   * 已加入且進行中／已結束才連到實踐頁（「我參加的挑戰」頁）。
   */
  href?: string;
}

/**
 * 共同挑戰卡片（探索共同挑戰頁）
 *
 * 樣式對齊 dashboard 的 InProgressTaskCard（POC：探索共同挑戰-standalone）：
 * 主題色背景 + 狀態 Badge + 挑戰旗標 + 「xx 座島」人數文案隨狀態變化。
 */
export const ChallengeCard = ({
  challenge,
  onJoinClick,
  onDrawClick,
  practiceId,
  href,
}: ChallengeCardProps) => {
  const t = useTranslations("challenge");
  const Theme = getChallengeThemeSvg(challenge.id);
  const formattedStartDate = formatCardDate(challenge.startDate);
  const daysProgress = calculateDaysProgress(challenge.startDate, challenge.endDate);

  const participantsLabel =
    challenge.runStatus === "ended"
      ? t("participants_ended", { count: challenge.participantCount })
      : challenge.runStatus === "ongoing"
        ? t("participants_ongoing", { count: challenge.participantCount })
        : t("participants_upcoming", { count: challenge.participantCount });

  const action = getChallengeCardAction(challenge, practiceId);
  const actionLabel = action.kind === "none" ? null : t(action.labelKey);
  const cardHref = href ?? action.href;
  const isLinked = cardHref !== null;
  // 未開始、或不知道實踐 id 而沒有連結：膠囊用不可點樣式，避免「看起來可點、點了沒反應」
  const isMuted = isChallengeActionMuted(action);

  return (
    <div
      className={cn(
        // 外框（圓角、邊框、hover）與探索活動課程卡一致（daodao#567）
        "group/card relative h-[239px] w-full overflow-hidden rounded-[20px] border border-[#E4EAE9] text-left transition-all duration-160",
        isLinked &&
          "hover:-translate-y-[3px] hover:border-logo-cyan/50 hover:shadow-[0_12px_26px_rgba(15,48,54,0.09)]"
      )}
    >
      <Theme
        className={cn(
          "absolute inset-0 h-full w-full",
          challenge.runStatus === "ended" && "saturate-[.3] opacity-65"
        )}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* 整張卡連到介紹頁或實踐頁（stretched link）：內容層 pointer-events-none 讓點擊落到連結，
          加入鈕、抽卡鈕另外 pointer-events-auto，避免 <button> 巢狀在 <a> 裡 */}
      {cardHref !== null && (href !== undefined || actionLabel !== null) && (
        <Link
          href={cardHref}
          aria-label={
            href !== undefined || actionLabel === null
              ? t("card_detail_link_label", { title: challenge.displayName })
              : t("card_link_label", { action: actionLabel, title: challenge.displayName })
          }
          className="absolute inset-0 z-[5] rounded-[20px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-logo-cyan"
        />
      )}

      <div
        className={`absolute inset-0 p-5 pb-6 z-10 flex flex-col ${isLinked ? "pointer-events-none" : ""}`}
      >
        {/* 已結束：文字變淡，與探索活動課程卡一致（daodao#567） */}
        <div
          className={cn(
            "flex-1 min-h-0 flex flex-col gap-1.5",
            challenge.runStatus === "ended" && "opacity-75"
          )}
        >
          <div className="flex items-center gap-1.5">
            <ExploreStatusBadge
              label={t(getChallengeStatusKey(challenge.runStatus, challenge.isJoined))}
              tone={STATUS_TONE[challenge.runStatus]}
            />
            <ChallengeFlagIcon />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="line-clamp-1 text-xl font-medium text-bg-dark">
                {challenge.displayName}
              </h3>
              {challenge.description && (
                <p className="line-clamp-2 text-xs text-text-dark">{challenge.description}</p>
              )}
            </div>
            {/* POC：可點的卡片標題右側有箭頭（點卡片進實踐頁） */}
            {isLinked && (
              <span aria-hidden className="flex w-10 shrink-0 items-center justify-center">
                <ArrowRightOutlineSvg className="size-6 opacity-60" />
              </span>
            )}
          </div>

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

          {"checkInCount" in challenge && typeof challenge.checkInCount === "number" && (
            <span className="flex items-center gap-1 text-xs text-text-dark">
              <CalendarCheck className="size-3.5 shrink-0 text-logo-cyan" />
              {t("card_checkin_count", { count: challenge.checkInCount })}
            </span>
          )}

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

        {action.kind === "join" ? (
          <span className="mt-2 shrink-0 flex justify-end">
            <Button
              className="pointer-events-auto"
              variant="secondary"
              size="sm"
              disabled={action.disabled}
              onClick={() => onJoinClick(challenge)}
            >
              {actionLabel}
              <ArrowRightOutlineSvg className="size-3.5 opacity-70" />
            </Button>
          </span>
        ) : action.kind !== "none" ? (
          <span className="mt-2 shrink-0 flex items-center justify-end gap-2">
            {challenge.hasInspirationDeck && challenge.runStatus !== "ended" && onDrawClick && (
              <button
                type="button"
                aria-label={t("draw_entry_label")}
                title={t("draw_entry_label")}
                className={`pointer-events-auto inline-flex size-7 cursor-pointer items-center justify-center rounded-full bg-basic-white transition-shadow hover:shadow-[0_4px_0_color-mix(in_srgb,theme(colors.logo-cyan)_40%,transparent)] ${
                  // POC：進行中的抽卡鈕陰影 40%，未開始 20%
                  challenge.runStatus === "ongoing"
                    ? "shadow-[0_4px_0_color-mix(in_srgb,theme(colors.logo-cyan)_40%,transparent)]"
                    : "shadow-[0_4px_0_color-mix(in_srgb,theme(colors.logo-cyan)_20%,transparent)]"
                }`}
                onClick={() => onDrawClick(challenge)}
              >
                <InspirationDeckIcon />
              </button>
            )}
            <span
              data-testid="challenge-card-action"
              aria-disabled={isMuted ? true : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full bg-basic-white px-3 py-1 text-[13px] ${
                isMuted ? "text-text-dark/45" : "text-text-dark"
              } ${
                // POC：可打卡的膠囊陰影 40%，停用／總結 20%
                action.kind === "checkin" && !isMuted
                  ? "shadow-[0_4px_0_color-mix(in_srgb,theme(colors.logo-cyan)_40%,transparent)]"
                  : "shadow-[0_4px_0_color-mix(in_srgb,theme(colors.logo-cyan)_20%,transparent)]"
              }`}
            >
              <CalendarCheck
                className={`size-4 ${isMuted ? "text-logo-cyan/50" : "text-logo-cyan"}`}
              />
              {actionLabel}
            </span>
          </span>
        ) : null}
      </div>

      <ChallengeProgressBar daysProgress={daysProgress} />
    </div>
  );
};
