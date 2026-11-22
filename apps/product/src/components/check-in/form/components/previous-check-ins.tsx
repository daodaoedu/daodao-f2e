"use client";

import { usePracticeCheckIns } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { format, isValid, parse } from "date-fns";
import { MOOD_OPTIONS, mapApiMoodToMoodType } from "@/constants/mood";
import { CheckInDescriptionText } from "../../display/check-in-description-text";

interface IPreviousCheckInsProps {
  practiceId: string;
}

export function PreviousCheckIns({ practiceId }: IPreviousCheckInsProps) {
  const t = useTranslations("check_in");
  const { data, error, isLoading } = usePracticeCheckIns(practiceId, { limit: 10 });
  const records = data?.data ?? [];

  return (
    <section
      aria-label={t("checkin_history_title")}
      className="mb-6 max-h-64 overflow-y-auto rounded-xl border border-light-gray bg-very-light-gray/60 p-3"
    >
      <h3 className="mb-2 text-sm font-semibold text-text-dark">{t("checkin_history_title")}</h3>
      {isLoading ? (
        <p className="py-2 text-sm text-text-dark/60">{t("loading")}</p>
      ) : error ? (
        <p role="alert" className="py-2 text-sm text-text-dark/60">
          {t("checkin_history_error")}
        </p>
      ) : records.length === 0 ? (
        <p className="py-2 text-sm text-text-dark/60">{t("checkin_history_empty")}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {records.map((record) => {
            const date = parse(record.checkinDate, "yyyy-MM-dd", new Date());
            const moodType = mapApiMoodToMoodType(record.mood);
            const mood = MOOD_OPTIONS.find((option) => option.id === moodType);
            const MoodIcon = mood?.emoji;

            return (
              <li key={record.id} className="rounded-lg bg-white px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs text-text-dark/65">
                  <time dateTime={record.checkinDate} className="font-medium tabular-nums">
                    {isValid(date) ? format(date, "yyyy/MM/dd") : record.checkinDate}
                  </time>
                  {MoodIcon && (
                    <span className="inline-flex items-center gap-1">
                      <MoodIcon className="size-4" aria-hidden="true" />
                      {moodType && t(`moods.${moodType}`)}
                    </span>
                  )}
                </div>
                {record.note && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-dark">
                    <CheckInDescriptionText content={record.note} />
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
