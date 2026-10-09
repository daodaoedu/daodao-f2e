"use client";

import {
  type ChallengeSummaryType,
  useChallenges,
  useCurrentUser,
  useMyChallenges,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { usePathname, useRouter } from "@daodao/i18n/navigation";
import { Spinner } from "@daodao/ui/components/spinner";
import { Box, Flag, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { ChallengeCard, InspirationDrawDialog, JoinChallengeDialog } from "@/components/challenge";
import { buildPracticeIdMap } from "@/utils/challenge-card";

/**
 * 探索共同挑戰 standalone 頁（openspec: challenge-discovery）
 *
 * 公開頁：未登入可瀏覽；點「現在加入」才要求登入。
 * 依運行狀態分三區：即將開始／進行中／已結束（版面依 POC 探索共同挑戰-standalone）。
 */
export default function ChallengesPage() {
  const t = useTranslations("challenge");
  const router = useRouter();
  const pathname = usePathname();
  const { data: currentUser } = useCurrentUser();
  const { data, isLoading, mutate } = useChallenges();
  // 探索列表不含自動複製的實踐 id；登入時從「我參加的挑戰」補上，讓已加入的卡片能點進實踐頁打卡
  const { data: mineData, mutate: mutateMine } = useMyChallenges(Boolean(currentUser));
  const [joinTarget, setJoinTarget] = useState<ChallengeSummaryType | null>(null);
  const [drawTarget, setDrawTarget] = useState<number | null>(null);
  // 剛加入的挑戰：先用 join API 回傳的 practiceId，避免「已加入但 /me/challenges 尚未更新」時卡片沒有連結
  const [justJoinedPracticeIds, setJustJoinedPracticeIds] = useState<Record<number, string | null>>(
    {}
  );

  const challenges = useMemo(() => data?.data ?? [], [data]);
  const practiceIdByChallenge = useMemo(
    () => buildPracticeIdMap(mineData?.data ?? [], justJoinedPracticeIds),
    [mineData, justJoinedPracticeIds]
  );
  const sections = useMemo(
    () =>
      [
        {
          key: "upcoming" as const,
          title: t("section_upcoming"),
          subtitle: t("section_upcoming_subtitle"),
          Icon: Star,
          iconClassName: "text-logo-cyan",
          items: challenges.filter((challenge) => challenge.runStatus === "upcoming"),
        },
        {
          key: "ongoing" as const,
          title: t("section_ongoing"),
          subtitle: null,
          Icon: Flag,
          iconClassName: "text-logo-cyan",
          items: challenges.filter((challenge) => challenge.runStatus === "ongoing"),
        },
        {
          key: "ended" as const,
          title: t("section_ended"),
          subtitle: t("section_ended_subtitle"),
          Icon: Box,
          iconClassName: "text-text-dark/55",
          items: challenges.filter((challenge) => challenge.runStatus === "ended"),
        },
      ].filter((section) => section.items.length > 0),
    [challenges, t]
  );

  const handleJoinClick = (challenge: ChallengeSummaryType) => {
    if (!currentUser) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setJoinTarget(challenge);
  };

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-10 px-4 pt-8 pb-18">
      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-bg-dark">
          <Flag className="size-6 text-logo-cyan" />
          {t("page_title")}
        </h1>
        <p className="text-sm text-text-dark">{t("page_subtitle")}</p>
      </header>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      )}

      {!isLoading && sections.length === 0 && (
        <p className="py-16 text-center text-sm text-text-dark">{t("empty")}</p>
      )}

      {sections.map((section) => (
        <section key={section.key}>
          <div className="flex items-center gap-2">
            <section.Icon className={`size-4.5 ${section.iconClassName}`} />
            <h2 className="m-0 text-lg font-bold text-bg-dark">{section.title}</h2>
            <span className="text-sm text-text-dark/40">· {section.items.length}</span>
          </div>
          {section.subtitle && (
            <p className="mt-1.5 ml-6.5 text-sm text-text-dark/70">{section.subtitle}</p>
          )}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.items.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoinClick={handleJoinClick}
                onDrawClick={(target) => setDrawTarget(target.id)}
                practiceId={practiceIdByChallenge.get(challenge.id)}
              />
            ))}
          </div>
        </section>
      ))}

      <JoinChallengeDialog
        challenge={joinTarget}
        onOpenChange={(open) => {
          if (!open) setJoinTarget(null);
        }}
        onJoined={({ challengeId, practiceId }) => {
          // 同步先記下實踐 id，再並行 revalidate 兩份列表；任一份先回來時卡片都已有連結
          setJustJoinedPracticeIds((prev) => ({ ...prev, [challengeId]: practiceId }));
          void Promise.all([mutate(), mutateMine()]);
        }}
      />

      <InspirationDrawDialog
        challengeId={drawTarget}
        onOpenChange={(open) => {
          if (!open) setDrawTarget(null);
        }}
      />
    </main>
  );
}
