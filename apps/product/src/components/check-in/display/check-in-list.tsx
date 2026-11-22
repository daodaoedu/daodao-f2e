"use client";

import type { PracticeCheckInsResponse } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { format, isValid, parse } from "date-fns";
import { ChevronRight } from "lucide-react";
import { MOOD_OPTIONS, MoodType, mapApiMoodToMoodType } from "@/constants/mood";
import { useCohortViewQuery } from "@/lib/cohort-view-query";

interface ICheckInListProps {
  practiceId: string;
  checkInsData?: PracticeCheckInsResponse;
}

const formatCheckInDate = (checkinDate: string): string => {
  const date = parse(checkinDate, "yyyy-MM-dd", new Date());
  return isValid(date) ? format(date, "yyyy/MM/dd") : checkinDate;
};

/**
 * Chronological, fully readable list of check-ins. The counterpart to
 * CheckInStack for people who need to scan every entry (e.g. cohort coaches).
 */
export const CheckInList = ({ practiceId, checkInsData }: ICheckInListProps) => {
  const t = useTranslations("check_in");
  const cohortViewQuery = useCohortViewQuery();
  const checkIns = checkInsData?.data ?? [];

  if (checkIns.length === 0) {
    return null;
  }

  return (
    <ol className="flex flex-col gap-2">
      {checkIns.map((checkIn) => {
        const mood = mapApiMoodToMoodType(checkIn.mood) ?? MoodType.neutral;
        const Emoji = MOOD_OPTIONS.find((option) => option.id === mood)?.emoji;
        const moodLabel = t(`moods.${mood}`);

        return (
          <li key={checkIn.id}>
            <Link
              href={`/practices/${practiceId}/check-ins/${checkIn.id}${cohortViewQuery}`}
              className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-[#F0F9F8]"
            >
              {Emoji && <Emoji className="mt-0.5 size-8 shrink-0" aria-hidden="true" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-[#6B8789]">
                  <time dateTime={checkIn.checkinDate} className="font-medium tabular-nums">
                    {formatCheckInDate(checkIn.checkinDate)}
                  </time>
                  <span>{moodLabel}</span>
                </div>
                {checkIn.note && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-dark">
                    {checkIn.note}
                  </p>
                )}
              </div>
              <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#9FB5B8]" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
};
