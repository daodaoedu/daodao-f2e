"use client";

import { useMyCohorts, useMyPractices } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import { differenceInMilliseconds, format, startOfTomorrow } from "date-fns";
import { ChevronDown, ChevronRight, ChevronUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CheckInButton } from "@/components/check-in";
import { CohortQueryScope } from "@/components/cohort/cohort-query-scope";
import { TaskStatus } from "@/constants/task-status";
import { isCohortQuickAccessVisible } from "@/utils/cohort-meeting-calendar";
import { isPracticeVisibleByDate } from "@/utils/practice-card";
import { practiceEndDateString, resolvePracticeDurationDays } from "@/utils/practice-period";

function getGreetingKey(): "greeting_morning" | "greeting_afternoon" | "greeting_evening" {
  const hour = new Date().getHours();
  if (hour < 11) return "greeting_morning";
  if (hour < 18) return "greeting_afternoon";
  return "greeting_evening";
}

interface PracticeCard {
  id: string;
  title: string;
  type: "personal" | "challenge";
  currentDays: number;
  totalDays: number;
  lastCheckInDate: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface PracticeDateSource {
  cohortId?: number;
  cohortStartDate?: string;
  cohortEndDate?: string;
  isChallenge?: boolean;
}

function isMoreCurrentPractice(
  candidate: PracticeDateSource & { startDate?: string; createdAt?: string },
  current: PracticeDateSource & { startDate?: string; createdAt?: string }
): boolean {
  const candidateStart = candidate.startDate ?? "";
  const currentStart = current.startDate ?? "";
  if (candidateStart !== currentStart) return candidateStart > currentStart;
  return (candidate.createdAt ?? "") > (current.createdAt ?? "");
}

export function YourToday() {
  return (
    <CohortQueryScope>
      <YourTodayContent />
    </CohortQueryScope>
  );
}

function YourTodayContent() {
  const t = useTranslations("dashboard");
  const tCheckIn = useTranslations("check_in");
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [today, setToday] = useState(() => format(new Date(), "yyyy-MM-dd"));
  useEffect(() => {
    const refreshDay = () => setToday(format(new Date(), "yyyy-MM-dd"));
    const timer = window.setTimeout(
      refreshDay,
      differenceInMilliseconds(startOfTomorrow(), new Date())
    );
    window.addEventListener("focus", refreshDay);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refreshDay);
    };
  }, [today]);
  const { data: practicesData } = useMyPractices({ limit: 20 });
  type ApiPractice = NonNullable<typeof practicesData>["data"][number];
  const {
    data: cohortsData,
    error: cohortsError,
    validationError: cohortsValidationError,
  } = useMyCohorts();
  const quickAccessCohorts = (
    cohortsError || cohortsValidationError ? [] : (cohortsData?.data ?? [])
  ).filter((cohort) => isCohortQuickAccessVisible(cohort));

  const cards = useMemo<PracticeCard[]>(() => {
    const practices = (practicesData?.data ?? []) as (ApiPractice & PracticeDateSource)[];
    const visiblePractices = practices.filter((practice) => {
      const isCohortPractice = practice.cohortId !== undefined && !practice.isChallenge;
      const startDate = isCohortPractice ? practice.cohortStartDate : practice.startDate;
      const endDate = isCohortPractice
        ? practice.cohortEndDate
        : practice.endDate || practiceEndDateString(practice.startDate, practice.durationDays);
      return (
        practice.status === "active" &&
        isPracticeVisibleByDate(startDate, endDate, new Date(`${today}T00:00:00`))
      );
    });

    // Use one check-in action per cohort, targeting its most recently started practice.
    const cohortPractices = new Map<number, (typeof visiblePractices)[number]>();
    const practicesForCards = visiblePractices.filter((practice) => {
      if (practice.cohortId === undefined || practice.isChallenge) return true;

      const current = cohortPractices.get(practice.cohortId);
      if (!current || isMoreCurrentPractice(practice, current)) {
        cohortPractices.set(practice.cohortId, practice);
      }
      return false;
    });
    practicesForCards.push(...cohortPractices.values());

    return practicesForCards.map((practice) => {
      const isCohortPractice = practice.cohortId !== undefined && !practice.isChallenge;
      // 總天數含頭尾，與實踐頁同一規則（daodao#277）
      const totalDays = resolvePracticeDurationDays(practice) ?? 1;
      return {
        id: practice.id,
        title: practice.title,
        type: practice.isChallenge ? ("challenge" as const) : ("personal" as const),
        currentDays: practice.checkInCount ?? 0,
        totalDays,
        lastCheckInDate: practice.lastCheckinAt ?? null,
        startDate: (isCohortPractice ? practice.cohortStartDate : practice.startDate) ?? null,
        endDate: isCohortPractice
          ? (practice.cohortEndDate ?? null)
          : practice.endDate || practiceEndDateString(practice.startDate, practice.durationDays),
      };
    });
  }, [practicesData, today]);

  const displayName = user?.name ?? "";
  const greetingKey = getGreetingKey();
  const quickAccessCount = cards.length + quickAccessCohorts.length;

  if (!user) return null;

  return (
    <section className="mb-4">
      {isExpanded ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-text-dark">
              {t(greetingKey, { name: displayName })}
            </h2>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="size-[26px] flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              aria-label="收合"
            >
              <ChevronUp className="size-[15px] text-text-dark/40" />
            </button>
          </div>

          {quickAccessCount > 0 ? (
            <div className="flex flex-wrap gap-[10px]">
              {quickAccessCohorts.map((cohort) => (
                <CustomLink
                  key={`cohort-${cohort.cohortId}`}
                  href={`/cohorts/${cohort.cohortId}`}
                  className="flex min-w-0 max-w-full items-center gap-3 px-4 py-[14px] rounded-[18px] hover:bg-white/50 transition-colors group"
                >
                  <span className="shrink-0 flex items-center justify-center size-6 rounded-full bg-[#0D7773]/10 text-[#0D7773]">
                    <Users className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-text-dark">
                      {cohort.displayName}
                    </p>
                    <p className="text-[11px] text-text-dark/40">
                      {t("my_cohorts_org", { org: cohort.organizationName })}
                    </p>
                  </div>
                  <ChevronRight className="size-[18px] text-text-dark/20 group-hover:text-text-dark/40 transition-colors" />
                </CustomLink>
              ))}
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="flex min-w-0 max-w-full items-center gap-3 rounded-[18px] px-4 py-[10px] transition-colors hover:bg-white/50"
                >
                  <span
                    className={cn(
                      "shrink-0 flex items-center justify-center size-6 rounded-full",
                      card.type === "challenge"
                        ? "bg-logo-cyan/10 text-logo-cyan"
                        : "bg-text-dark/10 text-text-dark"
                    )}
                  >
                    {card.type === "challenge" ? (
                      <svg
                        aria-hidden="true"
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </span>
                  <CustomLink
                    href={`/practices/${card.id}`}
                    className="group flex min-w-0 flex-1 items-center gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-dark">{card.title}</p>
                      <p className="text-[11px] text-text-dark/40">
                        {card.lastCheckInDate
                          ? t("your_today_days_progress", {
                              current: card.currentDays,
                              total: card.totalDays,
                            })
                          : t("your_today_first_checkin")}
                      </p>
                    </div>
                    <ChevronRight className="size-[18px] shrink-0 text-text-dark/20 transition-colors group-hover:text-text-dark/40" />
                  </CustomLink>
                  <CheckInButton
                    variant="ctaPrimary"
                    practiceId={card.id}
                    practiceStatus={TaskStatus.inProgress}
                    isChallenge={card.type === "challenge"}
                    lastCheckInDate={card.lastCheckInDate}
                    startDate={card.startDate}
                    endDate={card.endDate}
                    taskTitle={card.title}
                    labelOverride={tCheckIn("button_check_in")}
                    showIcon
                    className="h-8 min-w-16 shrink-0 self-center gap-1 rounded-full px-2.5 text-[11px] font-semibold shadow-[0_2px_6px_rgba(22,185,179,0.22)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(22,185,179,0.28)] active:translate-y-0 active:shadow-sm focus-visible:ring-2 focus-visible:ring-logo-cyan focus-visible:ring-offset-2 [&>svg]:size-3 [&_svg]:!text-white hover:[&_svg]:!text-primary-base"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-dark/40 py-3">{t("your_today_empty")}</p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 pb-3 border-b border-[#E3EFEE]">
          <h2 className="text-base font-semibold text-text-dark">
            {t(greetingKey, { name: displayName })}
          </h2>
          {quickAccessCount > 0 && (
            <span className="text-sm text-text-dark/40">
              {t("your_today_collapsed", { count: quickAccessCount })}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="ml-auto flex items-center gap-1 text-sm text-logo-cyan hover:underline"
          >
            {t("your_today_expand")}
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
