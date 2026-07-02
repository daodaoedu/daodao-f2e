"use client";

import { MyChallengesPage } from "@/components/challenges";
import { PageHeader } from "@/components/layout";

export default function MyChallengesRoute() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-[#F2F7F6]">
      <PageHeader leftAction="back" leftLabel="" title="我的挑戰" />
      <main className="max-w-[640px] mx-auto pb-10">
        <MyChallengesPage />
      </main>
    </div>
  );
}
