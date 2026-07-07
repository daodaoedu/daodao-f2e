"use client";

import { posthogCapture } from "@daodao/analytics";
import { Link } from "@daodao/i18n/navigation";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { getWeeklySummary } from "./checkin-stats";
import { TrendBars } from "./components";
import { learningLifeActions, useLearningLifeStore } from "./mock-store";

/** 島頁私有摘要卡 2：節奏洞察（本週一句話）→ 學習生活「洞察」 */
export function RhythmInsightCard() {
  const { checkins } = useLearningLifeStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const summary = getWeeklySummary(checkins, today);
  const max = Math.max(...summary.last7.map((d) => d.count), 1);

  return (
    <Link
      href="/me/learning-life"
      onClick={() => {
        posthogCapture("island_summary_card_clicked", { card: "rhythm" });
        learningLifeActions.setActiveTab("insights");
        learningLifeActions.setInsightView("cards");
      }}
      className="flex items-center gap-3 rounded-2xl border border-[#E4EAE9] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text-dark">我的節奏</p>
        <p className="truncate text-xs text-text-secondary">{summary.sentence}</p>
        <TrendBars
          className="mt-2 h-6 max-w-40"
          data={summary.last7.map((d) => ({ date: d.date, value: d.count || null }))}
          max={max}
        />
      </div>
      <ChevronRight className="size-4 shrink-0 text-text-secondary" />
    </Link>
  );
}
