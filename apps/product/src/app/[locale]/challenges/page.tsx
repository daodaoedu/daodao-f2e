"use client";

import { ChallengeListPage } from "@/components/challenges";
import { PageHeader } from "@/components/layout";

export default function ChallengesRoute() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <PageHeader leftAction="back" leftLabel="" title="共同挑戰" />
      <main className="max-w-[640px] mx-auto pb-10">
        <ChallengeListPage />
      </main>
    </div>
  );
}
