"use client";

import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "../components";
import { MOCK_INSIGHTS } from "../mock-data";
import { learningLifeActions, useLearningLifeStore } from "../mock-store";
import type { InsightView } from "../types";
import { CorrelationsView } from "./correlations-view";
import { DaysView } from "./days-view";
import { InsightCard } from "./insight-card";
import { TrendsView } from "./trends-view";
import { WeeklyHero } from "./weekly-hero";

const EXPLORE_ENTRIES: Array<{ view: Exclude<InsightView, "cards">; emoji: string; label: string }> = [
  { view: "trends", emoji: "📈", label: "趨勢" },
  { view: "days", emoji: "📅", label: "每日回顧" },
  { view: "correlations", emoji: "🔗", label: "相關性" },
];

interface InsightsTabProps {
  today: string;
}

export function InsightsTab({ today }: InsightsTabProps) {
  const { checkins, insightView } = useLearningLifeStore();

  if (insightView !== "cards") {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => learningLifeActions.setInsightView("cards")}
          className="flex w-fit items-center gap-1 text-sm text-[#636E72]"
        >
          <ArrowLeft className="size-4" />
          回洞察
        </button>
        {insightView === "trends" && <TrendsView today={today} />}
        {insightView === "days" && <DaysView />}
        {insightView === "correlations" && <CorrelationsView />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <WeeklyHero checkins={checkins} today={today} />

      <section>
        <SectionHeader
          title="系統發現"
          action={<span className="text-xs text-[#8A9BA0]">功能預覽</span>}
        />
        {/* 誠實框架：mock 洞察是個人化因果宣稱，須明示為預覽而非已發生的真實發現 */}
        <p className="mt-1 text-xs leading-relaxed text-[#8A9BA0]">
          正式版會從你的真實紀錄產生這些發現，以下先用示意內容感受。
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {MOCK_INSIGHTS.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDrillDown={learningLifeActions.setInsightView}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="深入探索" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {EXPLORE_ENTRIES.map((entry) => (
            <button
              type="button"
              key={entry.view}
              onClick={() => learningLifeActions.setInsightView(entry.view)}
              className="flex flex-col items-center gap-1 rounded-xl border border-[#E0E4E8] bg-white p-3 transition-colors hover:border-[#16B9B3]"
            >
              <span className="text-xl">{entry.emoji}</span>
              <span className="text-xs text-[#636E72]">{entry.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
