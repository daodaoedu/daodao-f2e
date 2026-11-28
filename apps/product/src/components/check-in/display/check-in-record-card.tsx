"use client";

import type { PracticeCheckInsResponse } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useMemo } from "react";
import { MoodType, mapApiMoodToMoodType } from "@/constants/mood";
import type { IMoodStat } from "../types";
import { MoodDistributionChart } from "./mood-distribution-chart";

interface ICheckInRecordCardProps {
  checkInsData?: PracticeCheckInsResponse;
  isLoading?: boolean;
  hideTitle?: boolean;
}

export const CheckInRecordCard = ({
  checkInsData,
  isLoading = false,
  hideTitle = false,
}: ICheckInRecordCardProps) => {
  const t = useTranslations("check_in");

  const checkIns = checkInsData?.data;
  const moodStats: IMoodStat[] = useMemo(() => {
    const counts = new Map<MoodType, number>();
    for (const checkIn of checkIns ?? []) {
      const mood = mapApiMoodToMoodType(checkIn.mood) ?? MoodType.neutral;
      counts.set(mood, (counts.get(mood) ?? 0) + 1);
    }

    return Array.from(counts, ([mood, count]) => ({ mood, count })).sort(
      (first, second) => second.count - first.count
    );
  }, [checkIns]);

  return (
    <div>
      {!hideTitle && <h3 className="font-medium text-text-dark mb-3">{t("record_title")}</h3>}
      <section className="rounded-lg bg-white px-4 py-3">
        {isLoading ? (
          <p className="py-3 text-center text-xs font-medium text-text-dark">{t("loading")}</p>
        ) : (
          <>
            <h4 className="text-xs font-medium text-text-dark">{t("mood")}</h4>
            <MoodDistributionChart moods={moodStats} />
          </>
        )}
      </section>
    </div>
  );
};
