"use client";

import { cn } from "@daodao/ui/lib/utils";
import { format, subDays } from "date-fns";
import { useMemo } from "react";
import { DayDetailCard } from "../components";
import type { DailyRecord } from "../types";
import { getDayOfWeek, getMoodEmoji } from "../utils";

interface DayTabProps {
  records: Record<string, DailyRecord>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function DayTab({ records, selectedDate, onSelectDate }: DayTabProps) {
  const weekDates = useMemo(() => {
    const ref = new Date(selectedDate);
    const dates: string[] = [];
    for (let i = 3; i >= -3; i--) {
      dates.push(format(subDays(ref, i), "yyyy-MM-dd"));
    }
    return dates;
  }, [selectedDate]);

  const selectedRecord = records[selectedDate];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between gap-1">
        {weekDates.map((dateStr) => {
          const record = records[dateStr];
          const isSelected = dateStr === selectedDate;
          const day = Number(dateStr.split("-")[2]);
          const dayOfWeek = getDayOfWeek(dateStr);

          return (
            <button
              type="button"
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors",
                isSelected
                  ? "bg-[#16B9B3] text-white"
                  : "bg-[#F5F7FA] text-[#636E72] hover:bg-[#E0E4E8]"
              )}
            >
              <span className="text-[10px]">週{dayOfWeek}</span>
              <span className="text-sm font-semibold">{day}</span>
              <span className="text-base">{record ? getMoodEmoji(record.mood) : "·"}</span>
            </button>
          );
        })}
      </div>

      {selectedRecord ? (
        <DayDetailCard record={selectedRecord} />
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-[#8A9BA0]">
          <span className="text-3xl">📝</span>
          <p className="text-sm">這天還沒有記錄</p>
        </div>
      )}
    </div>
  );
}
