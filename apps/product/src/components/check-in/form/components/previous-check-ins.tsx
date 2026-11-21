"use client";

import { usePracticeCheckIns } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { format, isValid, parse, subDays } from "date-fns";
import { MOOD_OPTIONS, mapApiMoodToMoodType } from "@/constants/mood";
import { CheckInDescriptionText } from "../../display/check-in-description-text";

interface IPreviousCheckInsProps {
  practiceId: string;
  isDemo?: boolean;
}

export function PreviousCheckIns({ practiceId, isDemo = false }: IPreviousCheckInsProps) {
  const t = useTranslations("check_in");
  const { data, error, isLoading } = usePracticeCheckIns(practiceId, { limit: 10 });
  const records = data?.data ?? [];
  const demoRecords = [
    {
      id: "demo-check-in-1",
      checkinDate: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      mood: "good" as const,
      note: "搭車時聽了一集英文 Podcast，記下 3 個新單字。",
    },
    {
      id: "demo-check-in-2",
      checkinDate: format(subDays(new Date(), 2), "yyyy-MM-dd"),
      mood: "happy" as const,
      note: "跟著影片練習自我介紹，開口比昨天更順了。",
    },
    {
      id: "demo-check-in-3",
      checkinDate: format(subDays(new Date(), 3), "yyyy-MM-dd"),
      mood: "neutral" as const,
      note: "今天有點累，只聽了 5 分鐘，但還是完成了。",
    },
  ];
  const historyRecords =
    isDemo && !isLoading && !error && records.length === 0 ? demoRecords : records;

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
      ) : historyRecords.length === 0 ? (
        <p className="py-2 text-sm text-text-dark/60">{t("checkin_history_empty")}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {historyRecords.map((record) => {
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
