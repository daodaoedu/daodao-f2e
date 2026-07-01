"use client";

import type { PracticeSummary } from "@daodao/api";
import type { PracticeStage } from "./hooks";
import { AiInsightCard } from "./sections/ai-insight-card";
import { CheckinHighlights } from "./sections/checkin-highlights";
import { HeroSection } from "./sections/hero-section";
import { NextStepCta } from "./sections/next-step-cta";
import { ReflectionSection } from "./sections/reflection-section";

interface Surface1Props {
  summary: PracticeSummary;
  stage: PracticeStage;
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  onSurfaceChange: (surface: 2 | 3) => void;
}

/**
 * Surface 1 — 實踐總結頁
 * @description Hero、AI 洞察、打卡精選、我的反思、下一步 CTA 五個區塊組成的主頁面
 */
export function Surface1Summary({
  summary,
  stage,
  reflectionText,
  onReflectionChange,
  onSurfaceChange,
}: Surface1Props) {
  return (
    <main className="max-w-[448px] mx-auto px-5 pb-24">
      <HeroSection summary={summary} stage={stage} />
      <AiInsightCard summary={summary} stage={stage} />
      <CheckinHighlights topNotes={summary.topNotes} />
      <ReflectionSection
        stage={stage}
        reflectionText={reflectionText}
        onReflectionChange={onReflectionChange}
        practiceId={summary.practiceId}
      />
      <NextStepCta stage={stage} onSurfaceChange={onSurfaceChange} summary={summary} />
    </main>
  );
}
