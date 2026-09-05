"use client";

import { type ChallengeSummaryType, joinChallenge, useChallenge } from "@daodao/api";
import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Calendar, CalendarCheck, Info, Timer } from "lucide-react";
import { useState } from "react";
import {
  ChallengeFlagIcon,
  ChallengeProgressBar,
  ChallengeStatusBadge,
  getChallengeThemeSvg,
} from "@/components/challenge/challenge-visual";
import { calculateDaysProgress, formatCardDate } from "@/utils/practice-card";

interface JoinChallengeDialogProps {
  challenge: ChallengeSummaryType | null;
  onOpenChange: (open: boolean) => void;
  /** 加入成功後讓列表重新整理（isJoined / participantCount） */
  onJoined?: () => void;
}

/**
 * 承接「現在加入」的確認彈窗（POC join modal）：
 * 挑戰資訊 + 全公開提示 → 加入 → 成功畫面（編輯我的共同挑戰）。
 */
export const JoinChallengeDialog = ({
  challenge,
  onOpenChange,
  onJoined,
}: JoinChallengeDialogProps) => {
  const t = useTranslations("challenge");
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [joinedPracticeId, setJoinedPracticeId] = useState<string | null>(null);

  const daysProgress = challenge
    ? calculateDaysProgress(challenge.startDate, challenge.endDate)
    : null;
  const formattedStartDate = challenge ? formatCardDate(challenge.startDate) : null;
  const Theme = challenge ? getChallengeThemeSvg(challenge.id) : null;
  const { data: detailData } = useChallenge(challenge?.id);
  const practiceAction = detailData?.data.template?.practiceAction ?? null;

  const handleJoin = async () => {
    if (!challenge || isJoining) return;
    setIsJoining(true);
    const response = await joinChallenge(challenge.id);
    setIsJoining(false);
    if (response.error) {
      toast.error(
        (response.error as { error?: { message?: string } }).error?.message ?? t("join_failed")
      );
      return;
    }
    setJoinedPracticeId(response.data?.data.practiceId ?? null);
    onJoined?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setJoinedPracticeId(null);
    onOpenChange(open);
  };

  return (
    <Dialog open={challenge !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {joinedPracticeId === null ? (
          <>
            <DialogHeader className="pt-6 text-left">
              <DialogTitle className="text-left text-xs font-medium text-logo-cyan">
                {t("join_hint")}
              </DialogTitle>
            </DialogHeader>

            {challenge && Theme && (
              <div className="relative h-[239px] w-full overflow-hidden rounded-[12px] text-left">
                <Theme
                  className="absolute inset-0 h-full w-full rounded-[12px]"
                  preserveAspectRatio="xMidYMid slice"
                />
                <div className="absolute inset-0 z-10 flex flex-col p-5 pb-6">
                  <div className="flex min-h-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <ChallengeStatusBadge runStatus={challenge.runStatus} />
                      <ChallengeFlagIcon />
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-2">
                        <h3 className="line-clamp-1 text-xl font-medium text-bg-dark">
                          {challenge.displayName}
                        </h3>
                        {challenge.description && (
                          <p className="line-clamp-2 text-xs text-text-dark">
                            {challenge.description}
                          </p>
                        )}
                      </div>
                      <span className="flex size-10 shrink-0 items-center justify-center self-center">
                        <ArrowRightOutlineSvg className="size-6 text-text-dark/60" />
                      </span>
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

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-text-dark">
                        <CalendarCheck className="size-3.5 shrink-0" />
                        {t("join_preview_upcoming")}
                      </span>
                    </div>
                  </div>

                  <span className="mt-2 flex shrink-0 justify-end">
                    <span className="inline-flex h-7 items-center justify-center gap-1.5 rounded-full bg-basic-white px-3 text-xs text-text-dark/45 shadow-sm">
                      <CalendarCheck className="size-4 text-logo-cyan/50" />
                      {t("join_preview_checkin")}
                    </span>
                  </span>
                </div>
                <ChallengeProgressBar daysProgress={daysProgress} />
              </div>
            )}

            {practiceAction && (
              <p className="text-xs text-text-dark/60 leading-relaxed">{practiceAction}</p>
            )}

            <div className="flex items-center gap-2 rounded-2xl bg-very-light-blue p-3">
              <Info className="size-4 shrink-0 text-logo-cyan" />
              <p className="text-xs text-text-dark">{t("join_note")}</p>
            </div>

            <Button className="w-full" disabled={isJoining} onClick={handleJoin}>
              {isJoining ? t("joining") : t("join_confirm")}
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("joined_heading")}</DialogTitle>
              <DialogDescription>{t("joined_body")}</DialogDescription>
            </DialogHeader>
            <Button
              className="w-full"
              onClick={() => {
                handleOpenChange(false);
                router.push(`/practices/${joinedPracticeId}`);
              }}
            >
              {t("joined_edit")}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
