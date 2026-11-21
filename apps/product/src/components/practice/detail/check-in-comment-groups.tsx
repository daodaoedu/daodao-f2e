"use client";

import { type PracticeCheckInsResponse, useComments } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { format, isValid, parse } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isApiCommentNode } from "@/components/check-in/display/api-comment-node";
import { CheckInCommentSheetContent } from "@/components/check-in/display/check-in-detail";
import { CheckInDescriptionText } from "@/components/check-in/display/check-in-description-text";
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
  isVisible: boolean;
  onCountChange: (checkInId: string, count: number) => void;
}

const formatCheckInDate = (checkinDate: string): string => {
  const date = parse(checkinDate, "yyyy-MM-dd", new Date());
  return isValid(date) ? format(date, "yyyy/MM/dd") : checkinDate;
};

/** One check-in's comment thread, headed by the check-in it belongs to. Hidden while it has no comments. */
function CheckInCommentGroup({
  practiceId,
  checkIn,
  isVisible,
  onCountChange,
  ...currentUser
}: ICheckInCommentGroupProps) {
  const t = useTranslations("check_in");
  const checkInId = String(checkIn.id);
  const cohortViewQuery = useCohortViewQuery();
  const { data: commentsData } = useComments({ targetType: "checkin", targetId: checkInId });

  const count = useMemo(() => {
    const raw = commentsData?.data;
    return Array.isArray(raw) ? countTotalComments(raw.filter(isApiCommentNode)) : 0;
  }, [commentsData]);

  useEffect(() => {
    onCountChange(checkInId, count);
  }, [checkInId, count, onCountChange]);

  if (count === 0) {
    return null;
  }

  const mood = mapApiMoodToMoodType(checkIn.mood) ?? MoodType.neutral;
  const Emoji = MOOD_OPTIONS.find((option) => option.id === mood)?.emoji;

  return (
    <li className={isVisible ? "overflow-hidden rounded-xl bg-white shadow-sm" : "hidden"}>
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
            <p className="mt-0.5 line-clamp-2 text-sm text-text-dark">
              <CheckInDescriptionText content={checkIn.note} />
            </p>
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
  onCountChange: (checkInId: string, count: number) => void;
}

/**
 * Check-in comment threads for the practice's Comments tab, so a reviewer
 * reads them alongside the practice comments without opening each check-in.
 */
export function CheckInCommentGroups({
  practiceId,
  checkInsData,
  onCountChange,
  ...currentUser
}: ICheckInCommentGroupsProps) {
  const t = useTranslations("app_product");
  const checkIns = checkInsData?.data ?? [];
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [showAll, setShowAll] = useState(false);

  const handleCountChange = useCallback(
    (checkInId: string, count: number) => {
      setCommentCounts((previous) =>
        previous[checkInId] === count ? previous : { ...previous, [checkInId]: count }
      );
      onCountChange(checkInId, count);
    },
    [onCountChange]
  );

  const checkInsWithComments = useMemo(
    () => checkIns.filter((checkIn) => (commentCounts[String(checkIn.id)] ?? 0) > 0),
    [checkIns, commentCounts]
  );
  const visibleCheckInIds = useMemo(
    () =>
      new Set(
        (showAll ? checkInsWithComments : checkInsWithComments.slice(0, 2)).map((checkIn) =>
          String(checkIn.id)
        )
      ),
    [checkInsWithComments, showAll]
  );

  if (checkIns.length === 0) {
    return null;
  }

  return (
    <section className="ml-14 mr-4 mt-4 mb-4 md:ml-12 md:mr-0 md:mt-1">
      <ol className="flex flex-col gap-3">
        {checkIns.map((checkIn) => (
          <CheckInCommentGroup
            key={checkIn.id}
            practiceId={practiceId}
            checkIn={checkIn}
            isVisible={visibleCheckInIds.has(String(checkIn.id))}
            onCountChange={handleCountChange}
            {...currentUser}
          />
        ))}
      </ol>
      {checkInsWithComments.length > 2 && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowAll((value) => !value)}
          className="mt-1 w-full h-auto py-3 text-sm text-[#6B8789] hover:text-text-dark/60"
        >
          {t(showAll ? "comments_show_less" : "comments_show_more")}
        </Button>
      )}
    </section>
  );
}
