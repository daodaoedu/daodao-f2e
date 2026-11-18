"use client";

import type { PracticeCheckInsResponse } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useMemo } from "react";
import { MOOD_OPTIONS, MoodType, mapApiMoodToMoodType } from "@/constants/mood";
import type { IMoodStat } from "../types";

interface ICheckInRecordCardProps {
  checkInsData?: PracticeCheckInsResponse;
  isLoading?: boolean;
}

export const CheckInRecordCard = ({ checkInsData, isLoading = false }: ICheckInRecordCardProps) => {
  const t = useTranslations("check_in");

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

    // 統計每個心情的出現次數（NULL mood fallback 到 neutral，避免被排除在心情排行之外）
    checkInsData.data.forEach((checkIn) => {
      const moodType = mapApiMoodToMoodType(checkIn.mood) ?? MoodType.neutral;
      const currentCount = moodCountMap.get(moodType) ?? 0;
      moodCountMap.set(moodType, currentCount + 1);
    });

    // 轉換為陣列格式
    return MOOD_OPTIONS.map((option) => ({
      mood: option.id,
      count: moodCountMap.get(option.id) ?? 0,
    }));
  }, [checkInsData]);

  if (isLoading) {
    return (
      <div>
        <div className="bg-white rounded-lg px-4 py-2">
          <div className="text-xs text-text-dark font-medium text-center py-4">{t("loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg px-4 py-2">
        <div className="flex items-center gap-6">
          <div className="shrink-0 text-xs font-medium text-text-dark">{t("mood")}</div>
          <ul className="m-0 flex min-w-0 list-none items-center gap-1.5 p-0" aria-label={t("mood")}>
            {MOOD_OPTIONS.map((moodOption, index) => {
              const stat = moodStats[index];
              const count = stat?.mood === moodOption.id ? stat.count : 0;
              const Emoji = moodOption.emoji;
              return (
                <li
                  key={moodOption.id}
                  className="flex shrink-0 flex-col items-center gap-0.5"
                  aria-label={`${t(`moods.${moodOption.id}`)}: ${count}`}
                >
                  <Emoji className="size-5" aria-hidden="true" />
                  <span className="text-[10px] leading-none tabular-nums text-text-dark" aria-hidden="true">
                    {count}
                  </span>
                  </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
