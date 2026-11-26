"use client";

import { useChallenge, useMyChallenges } from "@daodao/api";
import { useAuthContext } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Link, usePathname, useRouter } from "@daodao/i18n/navigation";
import { Spinner } from "@daodao/ui/components/spinner";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { InspirationDrawDialog, JoinChallengeDialog } from "@/components/challenge";
import { ChallengeDetailView } from "@/components/challenge/challenge-detail-view";
import { ExploreDetailShell } from "@/components/explore/explore-detail-shell";
import { buildPracticeIdMap, pruneJustJoined } from "@/utils/challenge-card";
import { parseChallengeId } from "@/utils/challenge-detail";

/**
 * 共同挑戰介紹頁（daodao#570）：公開頁，訪客也看得到；點「現在加入」才要求登入，登入後回到本頁。
 * 已加入的人從這裡前往自己的實踐（打卡／看總結）。
 */
export default function ChallengeDetailPage() {
  const t = useTranslations("challenge");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const challengeId = parseChallengeId(params.id);
  const { user, isLoading: authLoading } = useAuthContext();
  const { data, isLoading, mutate } = useChallenge(challengeId ?? undefined);
  const { data: mineData, mutate: mutateMine } = useMyChallenges(Boolean(user));
  const [joinOpen, setJoinOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  // 剛加入：先用 join API 回傳的實踐 id，「我參加的挑戰」更新前打卡鈕也有連結
  const [justJoined, setJustJoined] = useState<Record<number, string | null>>({});

  const challenge = data?.data;
  const practiceIdByChallenge = useMemo(
    () => buildPracticeIdMap(mineData?.data ?? [], justJoined),
    [mineData, justJoined]
  );
  useEffect(() => {
    if (!mineData) return;
    setJustJoined((prev) => pruneJustJoined(prev, mineData.data));
  }, [mineData]);

  const handleJoinClick = () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setJoinOpen(true);
  };

  let content: React.ReactNode;
  if (challengeId !== null && (isLoading || (authLoading && !challenge))) {
    content = (
      <div className="flex justify-center py-16">
        <Spinner aria-label={t("loading")} />
      </div>
    );
  } else if (!challenge) {
    content = (
      <>
        <Link
          href="/challenges"
          className="flex w-fit items-center gap-1.5 text-sm text-text-dark/70 hover:text-text-dark"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("detail_back")}
        </Link>
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-[#DCEBEA] bg-white px-6 py-14 text-center">
          <p className="m-0 text-base font-medium text-bg-dark">{t("detail_not_found")}</p>
          <Link href="/challenges" className="text-sm text-logo-cyan hover:underline">
            {t("detail_not_found_link")}
          </Link>
        </div>
      </>
    );
  } else {
    content = (
      <ChallengeDetailView
        challenge={challenge}
        practiceId={practiceIdByChallenge.get(challenge.id)}
        onJoinClick={handleJoinClick}
        onDrawClick={() => setDrawOpen(true)}
      />
    );
  }

  return (
    <ExploreDetailShell guestRedirect={pathname}>
      {content}

      <JoinChallengeDialog
        challenge={joinOpen && challenge ? challenge : null}
        onOpenChange={(open) => {
          if (!open) setJoinOpen(false);
        }}
        onJoined={({ challengeId: joinedId, practiceId }) => {
          setJustJoined((prev) => ({ ...prev, [joinedId]: practiceId }));
          void Promise.all([mutate(), mutateMine()]);
        }}
      />

      <InspirationDrawDialog
        challengeId={drawOpen && challenge ? challenge.id : null}
        onOpenChange={(open) => {
          if (!open) setDrawOpen(false);
        }}
      />
    </ExploreDetailShell>
  );
}
