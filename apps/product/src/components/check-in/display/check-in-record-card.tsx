"use client";

import type { PracticeCheckInsResponse } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronUp } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { MOOD_OPTIONS, type MoodType, mapApiMoodToMoodType } from "@/constants/mood";
import type { IMoodStat } from "../types";

interface ICheckInRecordCardProps {
  checkInsData?: PracticeCheckInsResponse;
  isLoading?: boolean;
}

export const CheckInRecordCard = ({ checkInsData, isLoading = false }: ICheckInRecordCardProps) => {
  const t = useTranslations("check_in");
  const [isExpanded, setIsExpanded] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // 從打卡記錄計算心情統計
  const moodStats: IMoodStat[] = useMemo(() => {
    if (!checkInsData?.data) {
      return MOOD_OPTIONS.map((option) => ({
        mood: option.id,
        count: 0,
      }));
    }

    // 初始化所有心情的計數為 0
    const moodCountMap = new Map<MoodType, number>();
    MOOD_OPTIONS.forEach((option) => {
      moodCountMap.set(option.id, 0);
    });

    // 統計每個心情的出現次數
    checkInsData.data.forEach((checkIn) => {
      const moodType = mapApiMoodToMoodType(checkIn.mood);
      if (moodType) {
        const currentCount = moodCountMap.get(moodType) ?? 0;
        moodCountMap.set(moodType, currentCount + 1);
      }
    });

    // 轉換為陣列格式
    return MOOD_OPTIONS.map((option) => ({
      mood: option.id,
      count: moodCountMap.get(option.id) ?? 0,
    }));
  }, [checkInsData]);

  const totalMoodCount = useMemo(
    () => moodStats.reduce((acc, curr) => acc + curr.count, 0),
    [moodStats]
  );

  useLayoutEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, []);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="font-medium text-text-dark mb-3">{t("record_title")}</h3>
        <div className="bg-white rounded-lg px-4 py-2">
          <div className="text-xs text-text-dark font-medium text-center py-4">{t("loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium text-text-dark mb-3">{t("record_title")}</h3>
      <div className="bg-white rounded-lg px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-text-dark font-medium">{t("mood_ranking")}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className="size-4.5"
            animation="none"
            aria-label={isExpanded ? t("collapse") : t("expand")}
            aria-expanded={isExpanded}
            aria-controls="mood-ranking-content"
          >
            <ChevronUp
              className={cn(
                "size-4 text-text-dark transition-transform duration-300 ease-in-out",
                isExpanded && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Button>
        </div>
        {/* Mood Ranking */}
        <div
          id="mood-ranking-content"
          ref={contentRef}
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            !isExpanded && "opacity-0",
            isExpanded && "opacity-100"
          )}
          style={{
            maxHeight: isExpanded ? `${contentHeight}px` : "0px",
          }}
          aria-hidden={!isExpanded}
        >
          <div className="flex justify-center gap-4">
            {MOOD_OPTIONS.map((moodOption, index) => {
              // 確保按照 MOOD_OPTIONS 的順序顯示，使用索引對應 moodStats
              const stat = moodStats[index];
              const count = stat?.mood === moodOption.id ? stat.count : 0;
              const Emoji = moodOption.emoji;
              return (
                <div key={moodOption.id} className="flex flex-col items-center gap-1">
                  <div className="relative w-1.5 h-15 bg-bg-gray rounded-full">
                    <div
                      className="absolute bottom-0 left-0 w-full h-full bg-logo-cyan rounded-full origin-bottom transition-transform duration-300"
                      style={{
                        transform: `scaleY(${totalMoodCount > 0 ? (count / totalMoodCount) * 100 : 0}%)`,
                      }}
                    />
                  </div>
                  <Emoji className="size-6" />
                  <div
                    className={cn(
                      "text-xs text-center text-light-gray",
                      count > 0 && " text-text-dark"
                    )}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
