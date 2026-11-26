"use client";

import type { ChallengeDetailType } from "@daodao/api";
import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button, buttonVariants } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowLeft, Calendar, CalendarCheck, Info, PencilRuler, Timer, Users } from "lucide-react";
import { cloneElement } from "react";
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
import { formatActivityPeriod } from "@/utils/activity-detail";
import { getChallengeStatusKey } from "@/utils/challenge-card";
import { type ChallengeDetailCta, getChallengeDetailCta } from "@/utils/challenge-detail";
import { calculateDaysProgress } from "@/utils/practice-card";

const STATUS_TONE: Record<ChallengeDetailType["runStatus"], ExploreBadgeTone> = {
  upcoming: "neutral",
  ongoing: "active",
  ended: "muted",
};

type ChallengeT = ReturnType<typeof useTranslations<"challenge">>;

interface ChallengeDetailViewProps {
  challenge: ChallengeDetailType;
  /** 已加入時自動複製的實踐 id，打卡／看總結的落點 */
  practiceId: string | null | undefined;
  onJoinClick: () => void;
  onDrawClick: () => void;
}

/**
 * 共同挑戰介紹頁內容（daodao#570）：完整介紹、期間與第幾天、每天要做的實踐、參與人數、抽卡說明；
 * 動作按鈕與卡片同一套規則（FR-CC-11），未加入的進行中／已結束改顯示一句說明。
 */
export function ChallengeDetailView({
  challenge,
  practiceId,
  onJoinClick,
  onDrawClick,
}: Readonly<ChallengeDetailViewProps>) {
  const t = useTranslations("challenge");
  const Theme = getChallengeThemeSvg(challenge.id);
  const daysProgress = calculateDaysProgress(challenge.startDate, challenge.endDate);
  const cta = getChallengeDetailCta(challenge, practiceId);
  const isEnded = challenge.runStatus === "ended";
  const canDraw = challenge.isJoined && challenge.hasInspirationDeck && !isEnded;

  const participantsLabel = isEnded
    ? t("participants_ended", { count: challenge.participantCount })
    : challenge.runStatus === "ongoing"
      ? t("participants_ongoing", { count: challenge.participantCount })
      : t("participants_upcoming", { count: challenge.participantCount });

  return (
    <>
      <Link
        href="/challenges"
        className="flex w-fit items-center gap-1.5 text-sm text-text-dark/70 hover:text-text-dark"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("detail_back")}
      </Link>

      {/* 標題區：沿用卡片的主題背景，讓人認得是同一個挑戰 */}
      <section className="relative overflow-hidden rounded-[20px] border border-[#E4EAE9]">
        <Theme
          aria-hidden="true"
          className={cn("absolute inset-0 h-full w-full", isEnded && "saturate-[.3] opacity-65")}
          preserveAspectRatio="xMidYMid slice"
        />
        <div className="relative z-10 flex flex-col gap-3 px-5 pt-5 pb-8">
          <div className="flex items-center gap-1.5">
            <ExploreStatusBadge
              label={t(getChallengeStatusKey(challenge.runStatus, challenge.isJoined))}
              tone={STATUS_TONE[challenge.runStatus]}
            />
            <ChallengeFlagIcon />
          </div>
          <h1 className="m-0 text-[22px] font-bold leading-[1.35] text-bg-dark min-[481px]:text-2xl">
            {challenge.displayName}
          </h1>
          <p className="m-0 text-sm text-text-dark">{challenge.programName}</p>
        </div>
        <ChallengeProgressBar daysProgress={daysProgress} />
      </section>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(240px,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <section
            aria-label={t("detail_info_label")}
            className="flex flex-col gap-4 rounded-[16px] border border-[#DCEBEA] bg-white p-[18px] min-[481px]:p-5"
          >
            <DetailRow icon={<Calendar />} label={t("detail_period_label")}>
              {formatActivityPeriod(challenge.startDate, challenge.endDate)}
            </DetailRow>
            {daysProgress !== null && (
              <DetailRow icon={<Timer />} label={t("detail_progress_label")}>
                {challenge.runStatus === "upcoming"
                  ? t("detail_progress_upcoming", { total: daysProgress.total })
                  : t("detail_progress", {
                      current: daysProgress.elapsed,
                      total: daysProgress.total,
                    })}
              </DetailRow>
            )}
            <DetailRow icon={<Users />} label={t("detail_participants_label")}>
              {participantsLabel}
            </DetailRow>
          </section>

          <DetailCta cta={cta} t={t} onJoinClick={onJoinClick} />

          <section aria-labelledby="challenge-about-title" className="flex flex-col gap-3">
            <h2 id="challenge-about-title" className="m-0 text-base font-bold text-bg-dark">
              {t("detail_about_title")}
            </h2>
            <p className="m-0 whitespace-pre-line text-sm leading-[1.7] text-text-dark">
              {challenge.description?.trim() || t("detail_about_empty")}
            </p>
          </section>
        </div>

        <aside aria-label={t("detail_practice_title")} className="flex min-w-0 flex-col gap-4">
          <section className="flex flex-col gap-3 rounded-[16px] border border-[#DCEBEA] bg-white p-[18px] min-[481px]:p-5">
            <h2 className="m-0 flex items-center gap-1.5 text-base font-bold text-bg-dark">
              <PencilRuler className="size-4" strokeWidth={1.6} aria-hidden="true" />
              {t("detail_practice_title")}
            </h2>
            {challenge.template ? (
              <>
                <p className="m-0 text-sm font-medium text-bg-dark">{challenge.template.title}</p>
                {challenge.template.practiceAction && (
                  <p className="m-0 whitespace-pre-line text-[13px] leading-[1.7] text-text-dark">
                    {challenge.template.practiceAction}
                  </p>
                )}
              </>
            ) : (
              <p className="m-0 text-sm text-text-dark/70">{t("detail_practice_empty")}</p>
            )}
          </section>

          {challenge.hasInspirationDeck && (
            <section className="flex flex-col gap-3 rounded-[16px] border border-[#DCEBEA] bg-white p-[18px] min-[481px]:p-5">
              <h2 className="m-0 flex items-center gap-2 text-base font-bold text-bg-dark">
                <span
                  aria-hidden="true"
                  className="relative inline-flex size-4 items-center justify-center"
                >
                  <InspirationDeckIcon />
                </span>
                {t("detail_draw_title")}
              </h2>
              <p className="m-0 text-[13px] leading-[1.7] text-text-dark">
                {t("detail_draw_description")}
              </p>
              {canDraw && (
                <Button variant="secondary" size="sm" className="w-fit" onClick={onDrawClick}>
                  {t("draw_entry_label")}
                </Button>
              )}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

/** 資訊列：圖示（label 僅供輔助技術）＋內容 */
function DetailRow({
  icon,
  label,
  children,
}: Readonly<{
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-start gap-3">
      <span
        role="img"
        aria-label={label}
        className="flex min-h-[21px] w-[18px] shrink-0 items-center justify-center text-text-dark/60"
      >
        {cloneElement(icon, {
          className: "size-4",
          "aria-hidden": true,
          strokeWidth: 1.6,
        } as object)}
      </span>
      <span className="min-w-0 flex-1 text-sm text-bg-dark">{children}</span>
    </div>
  );
}

/** 介紹頁動作；停用狀態以按鈕文字呈現原因，未加入的進行中／已結束顯示說明 */
function DetailCta({
  cta,
  t,
  onJoinClick,
}: Readonly<{ cta: ChallengeDetailCta; t: ChallengeT; onJoinClick: () => void }>) {
  switch (cta.kind) {
    case "join":
      return (
        <Button
          variant="default"
          className="w-full text-sm font-bold"
          disabled={cta.disabled}
          onClick={onJoinClick}
        >
          {t(cta.labelKey)}
          {!cta.disabled && <ArrowRightOutlineSvg className="size-4" />}
        </Button>
      );
    case "checkin":
    case "summary":
      if (cta.href === null) {
        return (
          <Button variant="default" className="w-full text-sm font-bold" disabled>
            {t(cta.labelKey)}
          </Button>
        );
      }
      return (
        <Link
          href={cta.href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full text-sm font-bold no-underline"
          )}
        >
          <CalendarCheck className="size-4" aria-hidden="true" />
          {t(cta.labelKey)}
        </Link>
      );
    case "checkin-disabled":
      return (
        <div className="flex flex-col gap-2">
          <Button variant="default" className="w-full text-sm font-bold" disabled>
            <CalendarCheck className="size-4" aria-hidden="true" />
            {t(cta.labelKey)}
          </Button>
          <p className="m-0 text-center text-xs text-text-dark/70">
            {t("detail_checkin_not_started")}
          </p>
        </div>
      );
    case "notice":
      return (
        <p
          role="note"
          className="m-0 flex items-start gap-2 rounded-lg border border-[#DCEBEA] bg-[#F6FAFA] px-4 py-3 text-sm leading-[1.6] text-text-dark/80"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-logo-cyan" aria-hidden="true" />
          {t(cta.noticeKey)}
        </p>
      );
  }
}
