"use client";

import { type PracticeCheckInsResponse, useComments } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { format, isValid, parse } from "date-fns";
import { useEffect, useMemo } from "react";
import { isApiCommentNode } from "@/components/check-in/display/api-comment-node";
import { CheckInCommentSheetContent } from "@/components/check-in/display/check-in-detail";
import { MOOD_OPTIONS, MoodType, mapApiMoodToMoodType } from "@/constants/mood";
import { useCohortViewQuery } from "@/lib/cohort-view-query";
import { countTotalComments } from "@/utils/count-comments";

type PracticeCheckIn = NonNullable<PracticeCheckInsResponse["data"]>[number];

interface ICurrentUserProps {
  currentUserName?: string;
  currentUserId?: string;
  currentUserPhotoURL?: string;
}

interface ICheckInCommentGroupProps extends ICurrentUserProps {
  practiceId: string;
  checkIn: PracticeCheckIn;
  onCountChange: (checkInId: string, count: number | null) => void;
}

const formatCheckInDate = (checkinDate: string): string => {
  const date = parse(checkinDate, "yyyy-MM-dd", new Date());
  return isValid(date) ? format(date, "yyyy/MM/dd") : checkinDate;
};

/** One check-in's comment thread, headed by the check-in it belongs to. Hidden while it has no comments. */
function CheckInCommentGroup({
  practiceId,
  checkIn,
  onCountChange,
  ...currentUser
}: ICheckInCommentGroupProps) {
  const t = useTranslations("check_in");
  const practiceT = useTranslations("practice");
  const cohortT = useTranslations("cohort");
  const checkInId = String(checkIn.id);
  const cohortViewQuery = useCohortViewQuery();
  const {
    data: commentsData,
    error,
    mutate,
  } = useComments({ targetType: "checkin", targetId: checkInId });

  const count = useMemo(() => {
    const raw = commentsData?.data;
    return Array.isArray(raw) ? countTotalComments(raw.filter(isApiCommentNode)) : null;
  }, [commentsData]);

  useEffect(() => {
    onCountChange(checkInId, error ? null : count);
  }, [checkInId, count, error, onCountChange]);

  if (error) {
    return (
      <li className="rounded-xl bg-white p-4 text-sm" role="alert">
        <p>{practiceT("load_failed")}</p>
        <Button
          variant="outline"
          onClick={() => {
            void mutate();
          }}
        >
          {cohortT("retry")}
        </Button>
      </li>
    );
  }

  if (count === null || count === 0) {
    return null;
  }

  const mood = mapApiMoodToMoodType(checkIn.mood) ?? MoodType.neutral;
  const Emoji = MOOD_OPTIONS.find((option) => option.id === mood)?.emoji;

  return (
    <li className="overflow-hidden rounded-xl bg-white shadow-sm">
      <Link
        href={`/practices/${practiceId}/check-ins/${checkInId}${cohortViewQuery}`}
        className="flex items-start gap-3 border-b border-[#E4EAE9] bg-[#F0F9F8] px-4 py-3 transition-colors hover:bg-[#E7FAF7]"
      >
        {Emoji && <Emoji className="mt-0.5 size-6 shrink-0" aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-[#6B8789]">
            <time dateTime={checkIn.checkinDate} className="font-medium tabular-nums">
              {formatCheckInDate(checkIn.checkinDate)}
            </time>
            <span>{t(`moods.${mood}`)}</span>
          </div>
          {checkIn.note && (
            <p className="mt-0.5 line-clamp-2 text-sm text-text-dark">{checkIn.note}</p>
          )}
        </div>
      </Link>
      <CheckInCommentSheetContent checkInId={checkInId} {...currentUser} />
    </li>
  );
}

interface ICheckInCommentGroupsProps extends ICurrentUserProps {
  practiceId: string;
  checkInsData?: PracticeCheckInsResponse;
  /** Shown above the groups once at least one check-in has comments */
  heading: string;
  /** Total number of comments across all check-ins, as known so far */
  totalCount: number;
  onCountChange: (checkInId: string, count: number | null) => void;
}

/**
 * Check-in comment threads for the practice's Comments tab, so a reviewer
 * reads them alongside the practice comments without opening each check-in.
 */
export function CheckInCommentGroups({
  practiceId,
  checkInsData,
  heading,
  totalCount,
  onCountChange,
  ...currentUser
}: ICheckInCommentGroupsProps) {
  const checkIns = checkInsData?.data ?? [];

  if (checkIns.length === 0) {
    return null;
  }

  return (
    <section className="mx-4 mb-4">
      {totalCount > 0 && (
        <h2 className="mb-2 px-1 text-xs font-medium text-[#6B8789]">{heading}</h2>
      )}
      <ol className="flex flex-col gap-3">
        {checkIns.map((checkIn) => (
          <CheckInCommentGroup
            key={checkIn.id}
            practiceId={practiceId}
            checkIn={checkIn}
            onCountChange={onCountChange}
            {...currentUser}
          />
        ))}
      </ol>
    </section>
  );
}
