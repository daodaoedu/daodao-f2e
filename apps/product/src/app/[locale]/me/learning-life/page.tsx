"use client";

import { LearningLifePage } from "@/components/learning-life";
import { PageHeader } from "@/components/layout";

export default function LearningLifeRoute() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-[#F2F7F6]">
      <PageHeader leftAction="back" leftLabel="" title="學習生活" />
      <main className="max-w-[640px] mx-auto pb-10">
        <LearningLifePage />
      </main>
    </div>
  );
}
