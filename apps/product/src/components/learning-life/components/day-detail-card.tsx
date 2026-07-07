import { Card } from "@daodao/ui/components/card";
import { METRIC_CONFIGS } from "../constants";
import type { DailyRecord } from "../types";
import { formatMetricValue, getDayOfWeek, getMoodEmoji } from "../utils";

interface DayDetailCardProps {
  record: DailyRecord;
}

const DISPLAY_METRICS = [
  "sleep",
  "steps",
  "exercise",
  "focus",
  "coffee",
  "water",
  "spend",
  "stress",
] as const;

export function DayDetailCard({ record }: DayDetailCardProps) {
  const dayOfWeek = getDayOfWeek(record.date);
  const [, month, day] = record.date.split("-");

  return (
    <Card className="border-[#E0E4E8] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#2D3436]">{`${Number(month)}/${Number(day)}`}</span>
          <span className="text-sm text-[#8A9BA0]">週{dayOfWeek}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl">{getMoodEmoji(record.mood)}</span>
          <span className="text-sm font-medium text-[#2D3436]">{record.mood}/9</span>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2">
        {DISPLAY_METRICS.map((key) => {
          const config = METRIC_CONFIGS.find((m) => m.key === key);
          if (!config) return null;
          const value = record[key];
          if (typeof value !== "number") return null;
          return (
            <div key={key} className="flex flex-col items-center rounded-lg bg-[#F5F7FA] p-2">
              <span className="text-sm">{config.emoji}</span>
              <span className="text-xs font-medium text-[#2D3436]">
                {formatMetricValue(value, key)}
              </span>
              <span className="text-[10px] text-[#8A9BA0]">{config.label}</span>
            </div>
          );
        })}
      </div>

      {record.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#F5F7FA] px-2 py-0.5 text-xs text-[#636E72]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {record.note && <p className="text-sm leading-relaxed text-[#636E72]">{record.note}</p>}
    </Card>
  );
}
