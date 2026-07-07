import { getWeeklySummary } from "../checkin-stats";
import { TrendBars } from "../components";
import type { MockCheckin } from "../types";

interface WeeklyHeroProps {
  checkins: MockCheckin[];
  today: string;
}

/** 第一層 Hero：本週一句話摘要（唯一焦點）＋ 7 天迷你趨勢 */
export function WeeklyHero({ checkins, today }: WeeklyHeroProps) {
  const summary = getWeeklySummary(checkins, today);
  const max = Math.max(...summary.last7.map((d) => d.count), 1);

  return (
    <div
      className="rounded-2xl px-5 py-4 text-white"
      style={{ background: "linear-gradient(135deg, #16B9B3, #0E8E89)" }}
    >
      <p className="text-xs opacity-80">本週摘要</p>
      <p className="mt-1 text-base font-semibold leading-relaxed">{summary.sentence}</p>
      <TrendBars
        className="mt-3"
        data={summary.last7.map((d) => ({ date: d.date, value: d.count || null }))}
        max={max}
        color="rgba(255,255,255,0.9)"
      />
    </div>
  );
}
