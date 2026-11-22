"use client";

import type { PracticeCheckInsResponse } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { format, isValid, parse } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { MOOD_DISPLAY_OPTIONS, MoodType, mapApiMoodToMoodType } from "@/constants/mood";
import { useCohortViewQuery } from "@/lib/cohort-view-query";
import { CheckInDescriptionText } from "./check-in-description-text";

interface ICheckInListProps {
  practiceId: string;
  checkInsData?: PracticeCheckInsResponse;
}

const formatCheckInDate = (checkinDate: string): string => {
  const date = parse(checkinDate, "yyyy-MM-dd", new Date());
  return isValid(date) ? format(date, "yyyy/MM/dd") : checkinDate;
};

const CHECK_IN_NOTE_PREVIEW_LENGTH = 25;

const truncateCheckInNote = (note: string): string => {
  const characters = Array.from(note);
  return characters.length > CHECK_IN_NOTE_PREVIEW_LENGTH
    ? `${characters.slice(0, CHECK_IN_NOTE_PREVIEW_LENGTH).join("")}...`
    : note;
};

/**
 * Chronological, fully readable list of check-ins. The counterpart to
 * CheckInStack for people who need to scan every entry (e.g. cohort coaches).
 */
export const CheckInList = ({ practiceId, checkInsData }: ICheckInListProps) => {
  const t = useTranslations("check_in");
  const tAppProduct = useTranslations("app_product");
  const cohortViewQuery = useCohortViewQuery();
  const checkIns = checkInsData?.data ?? [];
  const [visibleCount, setVisibleCount] = useState(3);

  if (checkIns.length === 0) {
    return null;
  }

  return (
    <ol className="flex flex-col gap-2">
      {checkIns.slice(0, visibleCount).map((checkIn) => {
        const mood = mapApiMoodToMoodType(checkIn.mood) ?? MoodType.neutral;
        const moodOption = MOOD_DISPLAY_OPTIONS.find((option) => option.id === mood);
        const Emoji = moodOption?.emoji;
        const moodLabel = moodOption ? t(`moods.${mood}`) : null;

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
                  {moodLabel && <span>{moodLabel}</span>}
                </div>
                {checkIn.note && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-dark">
                    <CheckInDescriptionText content={truncateCheckInNote(checkIn.note)} />
                  </p>
                )}
              </div>
              <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#9FB5B8]" />
            </Link>
          </li>
        );
      })}
      {checkIns.length > visibleCount && (
        <li>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setVisibleCount((count) => count + 3)}
            className="w-full h-auto py-3 text-sm text-[#6B8789] hover:text-text-dark/60"
          >
            {tAppProduct("comments_show_more")}
          </Button>
        </li>
      )}
    </ol>
  );
};
