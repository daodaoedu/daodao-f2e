"use client";

import type { ChallengeSummaryType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Badge, type BadgeProps } from "@daodao/ui/components/badge";
import { Flag } from "lucide-react";
import { PracticeTheme, practiceThemeSvgMap } from "@/constants/practice-theme";
import type { calculateDaysProgress } from "@/utils/practice-card";

/** 卡片背景主題：依 id 輪替，讓探索頁有變化又保持穩定 */
const THEME_ROTATION = [
  PracticeTheme.yellow,
  PracticeTheme.blue,
  PracticeTheme.pink,
  PracticeTheme.green,
] as const;

/** 挑戰卡片背景主題 svg，卡片列表與加入彈窗預覽共用同一組輪替規則 */
export const getChallengeThemeSvg = (id: number) => {
  const themeName = THEME_ROTATION[id % THEME_ROTATION.length] ?? PracticeTheme.yellow;
  return practiceThemeSvgMap[themeName] ?? practiceThemeSvgMap[PracticeTheme.yellow];
};

const STATUS_BADGE: Record<ChallengeSummaryType["runStatus"], BadgeProps["variant"]> = {
  upcoming: "very-light-blue",
  ongoing: "default",
  ended: "outline-logo",
};

export const ChallengeStatusBadge = ({
  runStatus,
}: {
  runStatus: ChallengeSummaryType["runStatus"];
}) => {
  const t = useTranslations("challenge");
  return (
    <Badge variant={STATUS_BADGE[runStatus]} size="sm" className="w-fit">
      {t(`status_${runStatus}`)}
    </Badge>
  );
};

export const ChallengeFlagIcon = () => {
  const t = useTranslations("challenge");
  return (
    <span
      role="img"
      aria-label={t("challenge_tag")}
      title={t("challenge_tag")}
      className="inline-flex items-center justify-center size-6 rounded-full border border-logo-cyan bg-light-blue"
    >
      <Flag className="size-3.5 text-text-dark/75" />
    </span>
  );
};

/** 挑戰期間進度條，貼齊卡片容器（外層需為 position:relative）底部 */
export const ChallengeProgressBar = ({
  daysProgress,
}: {
  daysProgress: ReturnType<typeof calculateDaysProgress>;
}) => {
  if (daysProgress === null) return null;
  return (
    <div className="absolute right-5 bottom-1.5 left-5 z-10">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/75 shadow-[inset_0_0_0_1px_rgba(15,48,54,0.08)]">
        <div
          className="h-full bg-logo-cyan"
          style={{ width: `${Math.round((daysProgress.elapsed / daysProgress.total) * 100)}%` }}
        />
      </div>
    </div>
  );
};
