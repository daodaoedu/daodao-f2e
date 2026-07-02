"use client";

import { useParams } from "@daodao/i18n/navigation";
import { SeasonPage } from "@/components/challenges";
import { getChallengeById } from "@/components/challenges/mock-data";
import { PageHeader } from "@/components/layout";

export default function SeasonRoute() {
  const params = useParams<{ challengeId: string; seasonId: string }>();
  const challenge = getChallengeById(params.challengeId);
  const season = challenge?.seasons.find((s) => s.id === params.seasonId);

  if (!challenge || !season) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-text-secondary">找不到這一期挑戰</p>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <PageHeader leftAction="back" leftLabel="" title={`第 ${season.seasonNumber} 期`} />
      <main className="max-w-[640px] mx-auto pb-10">
        <SeasonPage challenge={challenge} season={season} />
      </main>
    </div>
  );
}
