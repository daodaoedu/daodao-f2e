"use client";

import { cn } from "@daodao/ui/lib/utils";
import { format, parseISO, subDays } from "date-fns";
import { useMemo } from "react";
import { CheckinCard, MetricPill } from "../components";
import { METRIC_CONFIGS } from "../constants";
import { learningLifeActions, useLearningLifeStore } from "../mock-store";
import { formatMetricValue, getDayOfWeek } from "../utils";

/** 每日回顧：一天的橫切面 — 打卡（主角）＋當日脈絡（配角） */
export function DaysView() {
  const { records, checkins, selectedDate } = useLearningLifeStore();

  const weekDates = useMemo(() => {
    const ref = parseISO(selectedDate);
    const dates: string[] = [];
    for (let i = 3; i >= -3; i--) {
      dates.push(format(subDays(ref, i), "yyyy-MM-dd"));
    }
    return dates;
  }, [selectedDate]);

  const dayCheckins = checkins.filter((c) => c.checkinDate === selectedDate);
  const record = records[selectedDate];
  const hasContext = record && (record.energy > 0 || record.sleep > 0 || record.contextTags.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between gap-1">
        {weekDates.map((dateStr) => {
          const count = checkins.filter((c) => c.checkinDate === dateStr).length;
          const isSelected = dateStr === selectedDate;
          const day = Number(dateStr.split("-")[2]);
          let checkinMark = "·";
          if (count === 1) checkinMark = "✓";
          if (count > 1) checkinMark = `✓${count}`;
          return (
            <button
              type="button"
              key={dateStr}
              onClick={() => learningLifeActions.setSelectedDate(dateStr)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors",
                isSelected
                  ? "bg-logo-cyan text-white"
                  : "bg-[#F5F7FA] text-[#636E72] hover:bg-[#E0E4E8]"
              )}
            >
              <span className="text-[10px]">週{getDayOfWeek(dateStr)}</span>
              <span className="text-sm font-semibold">{day}</span>
              <span className={cn("text-[10px]", isSelected ? "text-white" : "text-logo-cyan")}>
                {checkinMark}
              </span>
            </button>
          );
        })}
      </div>

      {dayCheckins.length > 0 ? (
        <div className="flex flex-col gap-3">
          {dayCheckins.map((checkin) => (
            <CheckinCard key={checkin.id} checkin={checkin} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-[#8A9BA0]">
          <span className="text-3xl">🌊</span>
          <p className="text-sm">這天島上很安靜，沒有打卡</p>
        </div>
      )}

      {hasContext && (
        <section>
          <p className="mb-2 text-xs text-[#8A9BA0]">當日狀態</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {METRIC_CONFIGS.map((config) => {
              const value = record[config.key];
              if (!value) return null;
              return (
                <MetricPill
                  key={config.key}
                  emoji={config.emoji}
                  label={config.label}
                  value={formatMetricValue(value, config.key)}
                  unit={config.unit}
                />
              );
            })}
          </div>
          {record.contextTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {record.contextTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F5F7FA] px-2 py-0.5 text-xs text-[#636E72]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {record.note && (
            <p className="mt-2 text-sm leading-relaxed text-[#636E72]">{record.note}</p>
          )}
        </section>
      )}
    </div>
  );
}
