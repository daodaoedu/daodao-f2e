"use client";

import { type ChallengeSummaryType, joinChallenge } from "@daodao/api";
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
import { Calendar, Flag, Info, Timer } from "lucide-react";
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
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="size-4.5 text-logo-cyan" />
                {t("join_dialog_title")}
              </DialogTitle>
              <DialogDescription>{t("join_hint")}</DialogDescription>
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

                    <h3 className="line-clamp-1 text-xl font-medium text-bg-dark">
                      {challenge.displayName}
                    </h3>
                    {challenge.description && (
                      <p className="line-clamp-2 text-xs text-text-dark">
                        {challenge.description}
                      </p>
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
                  </div>
                </div>
                <ChallengeProgressBar daysProgress={daysProgress} />
              </div>
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
