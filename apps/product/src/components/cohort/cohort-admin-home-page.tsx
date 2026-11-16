"use client";

import {
  useLighthouseCohort,
  useLighthouseCohortEnrollments,
  useLighthouseOutcome,
  useLighthouseParticipantCheckins,
  useLighthouseParticipants,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Empty, EmptyDescription } from "@daodao/ui/components/empty";
import { Input } from "@daodao/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import { Spinner } from "@daodao/ui/components/spinner";
import { ArrowDown, ArrowUp, ArrowUpDown, ArrowUpRight } from "lucide-react";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { CohortErrorState } from "@/components/lighthouse/cohort-error-state";
import { useEffect, useState } from "react";

const ALL_PRACTICES = "__all_practices__";
type SortField = "name" | "checkins" | "activity";
type SortDirection = "asc" | "desc";

function formatDate(date: string | null | undefined) {
  return date ? date.slice(0, 10).replaceAll("-", "/") : "—";
}

export function CohortAdminHomePage({
  programId,
  cohortId,
}: {
  programId: number;
  cohortId: number;
}) {
  const t = useTranslations("cohort");
  const lighthouseT = useTranslations("lighthouse");
  const [search, setSearch] = useState("");
  const [selectedPractice, setSelectedPractice] = useState(ALL_PRACTICES);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const cohortQuery = useLighthouseCohort(programId, cohortId);
  const enrollmentQuery = useLighthouseCohortEnrollments(programId, cohortId);
  const participantsQuery = useLighthouseParticipants(programId, cohortId);
  const outcomeQuery = useLighthouseOutcome(programId, cohortId);
  const cohort = cohortQuery.data?.data;
  const enrollments = enrollmentQuery.data?.data;
  const participants = participantsQuery.data?.data;
  const outcome = outcomeQuery.data?.data;
  const joinedEnrollments =
    enrollments?.filter((enrollment) => enrollment.status === "joined") ?? [];
  const joinedEnrollmentsByUserId = new Map(
    joinedEnrollments
      .filter((enrollment) => enrollment.userId !== null)
      .map((enrollment) => [enrollment.userId as number, enrollment] as const)
  );
  const joinedPracticeRows =
    participants?.items.filter((item) => joinedEnrollmentsByUserId.has(item.userId)) ?? [];
  const practiceTitles = Array.from(
    new Set(joinedPracticeRows.map((item) => item.practiceTitle))
  ).sort((a, b) => a.localeCompare(b));
  const visiblePracticeRows = joinedPracticeRows.filter(
    (item) => selectedPractice === ALL_PRACTICES || item.practiceTitle === selectedPractice
  );
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const activityByParticipantPractice = new Map(
    outcome?.participantProgress.map((item) => [
      `${item.userId}:${item.practiceId}`,
      item.lastActivityAt,
    ] as const) ?? []
  );
  const participantsByUserId = new Map<
    number,
    {
      userId: number;
      nickname: string | null;
      email: string | null;
      practiceId: number;
      practiceTitle: string;
      checkinCount: number;
      lastActivityAt: string | null;
    }
  >();

  for (const practice of visiblePracticeRows) {
    const enrollment = joinedEnrollmentsByUserId.get(practice.userId);
    if (!enrollment) continue;
    const nickname = enrollment.nickname ?? practice.nickname;
    if (
      normalizedSearch &&
      !`${nickname ?? ""} ${enrollment.email ?? ""}`.toLocaleLowerCase().includes(normalizedSearch)
    ) {
      continue;
    }
    const existing = participantsByUserId.get(practice.userId);
    const lastActivityAt =
      activityByParticipantPractice.get(`${practice.userId}:${practice.practiceId}`) ?? null;
    const existingLastActivityAt = existing?.lastActivityAt;
    const isMoreRecentPractice =
      lastActivityAt !== null &&
      (existingLastActivityAt === null ||
        existingLastActivityAt === undefined ||
        lastActivityAt > existingLastActivityAt);
    const isPreferredPractice =
      !existing ||
      isMoreRecentPractice ||
      (lastActivityAt === (existingLastActivityAt ?? null) &&
        practice.practiceTitle.localeCompare(existing.practiceTitle) < 0);
    participantsByUserId.set(practice.userId, {
      userId: practice.userId,
      nickname: existing?.nickname ?? nickname,
      email: enrollment.email,
      practiceId: isPreferredPractice ? practice.practiceId : existing.practiceId,
      practiceTitle: isPreferredPractice ? practice.practiceTitle : existing.practiceTitle,
      checkinCount: (existing?.checkinCount ?? 0) + practice.checkinCount,
      lastActivityAt: isMoreRecentPractice
        ? lastActivityAt
        : (existing?.lastActivityAt ?? lastActivityAt),
    });
  }
  const participantCards = Array.from(participantsByUserId.values()).sort((a, b) => {
    if (sortField === "checkins") {
      return (a.checkinCount - b.checkinCount) * (sortDirection === "asc" ? 1 : -1);
    }
    if (sortField === "activity") {
      if (a.lastActivityAt === null && b.lastActivityAt !== null) return 1;
      if (a.lastActivityAt !== null && b.lastActivityAt === null) return -1;
      return (
        (a.lastActivityAt ?? "").localeCompare(b.lastActivityAt ?? "") *
        (sortDirection === "asc" ? 1 : -1)
      );
    }
    return (
      (a.nickname ?? "").localeCompare(b.nickname ?? "") *
      (sortDirection === "asc" ? 1 : -1)
    );
  });
  const toggleSort = (field: Exclude<SortField, "name">) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("desc");
  };
  const isLoading =
    cohortQuery.isLoading ||
    enrollmentQuery.isLoading ||
    participantsQuery.isLoading ||
    outcomeQuery.isLoading;
  const hasError =
    cohortQuery.error ||
    cohortQuery.validationError ||
    enrollmentQuery.error ||
    enrollmentQuery.validationError ||
    participantsQuery.error ||
    participantsQuery.validationError ||
    outcomeQuery.error ||
    outcomeQuery.validationError;

  if (isLoading)
    return (
      <div className="flex min-h-64 items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    );

  if (hasError)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => {
          void cohortQuery.mutate();
          void enrollmentQuery.mutate();
          void participantsQuery.mutate();
          void outcomeQuery.mutate();
        }}
      />
    );

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />
      <main className="relative z-[25] min-h-screen bg-very-light-gray pb-[72px]">
        <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
          <header className="mb-6">
            <p className="text-xs font-medium text-logo-cyan">{cohort?.organizationName}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-lg font-bold text-text-dark">
                {cohort?.displayName ?? t("cohort_home")}
              </h1>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0 gap-2 border-[#CDEBE8] text-[#0D7773] hover:border-logo-cyan hover:bg-logo-cyan hover:text-white"
              >
                <CustomLink href={`/lighthouse/programs/${programId}/cohorts/${cohortId}/dashboard`}>
                  {lighthouseT("manage_cohort")}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </CustomLink>
              </Button>
            </div>
          </header>

          <section aria-label={t("joined_participant_practices")}>
            <div className="mb-4 flex justify-end">
              <span className="text-xs text-text-dark/55">
                {t("joined_members_count", { count: joinedEnrollments.length })}
              </span>
            </div>

            <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_260px]">
              <Input
                type="search"
                aria-label={lighthouseT("participants_search")}
                placeholder={lighthouseT("participants_search")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 bg-white text-sm"
              />
              <Select value={selectedPractice} onValueChange={setSelectedPractice}>
                <SelectTrigger
                  className="h-10 bg-white text-sm"
                  aria-label={t("practice_filter_label")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_PRACTICES}>
                    {lighthouseT("dashboard_all_practices")}
                  </SelectItem>
                  {practiceTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!participantCards.length ? (
              <Empty className="rounded-xl bg-white shadow-sm">
                <EmptyDescription>
                  {search || selectedPractice !== ALL_PRACTICES
                    ? t("no_matching_joined_participants")
                    : t("no_joined_participant_practices")}
                </EmptyDescription>
              </Empty>
            ) : (
              <>
                <div className="mb-2 grid grid-cols-12 gap-x-2 gap-y-2 px-4 text-[11px] font-medium text-text-dark/55 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,2.25fr)_minmax(80px,0.65fr)_minmax(100px,0.8fr)] sm:gap-x-3 sm:px-5 sm:text-xs">
                  <span className="col-span-5 whitespace-nowrap sm:col-span-1">
                    {lighthouseT("col_participant")}
                  </span>
                  <span className="col-span-7 whitespace-nowrap sm:col-span-1">{lighthouseT("col_email")}</span>
                  <span className="col-span-6 whitespace-nowrap sm:col-span-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-sm hover:text-text-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
                      onClick={() => toggleSort("checkins")}
                      aria-label={`Sort by ${t("checkin_count_label")}`}
                      aria-pressed={sortField === "checkins"}
                    >
                      {t("checkin_count_label")}
                      {sortField === "checkins" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp aria-hidden="true" className="size-3" />
                        ) : (
                          <ArrowDown aria-hidden="true" className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown aria-hidden="true" className="size-3 opacity-60" />
                      )}
                    </button>
                  </span>
                  <span className="col-span-6 whitespace-nowrap sm:col-span-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-sm hover:text-text-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
                      onClick={() => toggleSort("activity")}
                      aria-label={`Sort by ${t("participant_latest_activity")}`}
                      aria-pressed={sortField === "activity"}
                    >
                      {t("participant_latest_activity")}
                      {sortField === "activity" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp aria-hidden="true" className="size-3" />
                        ) : (
                          <ArrowDown aria-hidden="true" className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown aria-hidden="true" className="size-3 opacity-60" />
                      )}
                    </button>
                  </span>
                </div>
                <ul className="grid gap-3">
                  {participantCards.map((participant) => (
                    <li key={participant.userId}>
                      <CohortAdminParticipantCard
                        participant={participant}
                        participantRefs={participantCards.map(({ userId, practiceId }) => ({
                          userId,
                          practiceId,
                        }))}
                        programId={programId}
                        cohortId={cohortId}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function CohortAdminParticipantCard({
  participant,
  participantRefs,
  programId,
  cohortId,
}: {
  participant: {
    userId: number;
    nickname: string | null;
    email: string | null;
    practiceId: number;
    checkinCount: number;
    lastActivityAt: string | null;
  };
  participantRefs: { userId: number; practiceId: number }[];
  programId: number;
  cohortId: number;
}) {
  const t = useTranslations("cohort");
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);
  const checkinsQuery = useLighthouseParticipantCheckins(
    programId,
    cohortId,
    isOpening ? participant.userId : undefined,
    isOpening ? participant.practiceId : undefined
  );
  const externalPracticeId = checkinsQuery.data?.data.practice.externalId;
  const hasOpenError = checkinsQuery.error || checkinsQuery.validationError;

  useEffect(() => {
    if (!isOpening) return;
    if (externalPracticeId) {
      setIsOpening(false);
      const participantIndex = participantRefs.findIndex(
        (item) => item.userId === participant.userId && item.practiceId === participant.practiceId
      );
      const params = new URLSearchParams({
        view: "cohort-admin",
        programId: String(programId),
        cohortId: String(cohortId),
        members: participantRefs.map(({ userId, practiceId }) => `${userId}:${practiceId}`).join(","),
        memberIndex: String(participantIndex),
      });
      router.push(`/practices/${externalPracticeId}?${params.toString()}`);
      return;
    }
    if (checkinsQuery.data || hasOpenError) setOpenFailed(true);
  }, [
    checkinsQuery.data,
    cohortId,
    externalPracticeId,
    hasOpenError,
    isOpening,
    participant.practiceId,
    participant.userId,
    participantRefs,
    programId,
    router,
  ]);

  return (
    <button
      type="button"
      className="relative w-full cursor-pointer rounded-xl border border-[#DCEBEA] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#A8D9D4] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan sm:px-5 sm:py-4"
      aria-label={t("open_participant_practice", {
        name: participant.nickname ?? t("learner"),
      })}
      aria-busy={isOpening && checkinsQuery.isLoading}
      disabled={isOpening && checkinsQuery.isLoading}
      onClick={() => {
        setOpenFailed(false);
        setIsOpening(true);
      }}
    >
      <span className="grid grid-cols-12 items-center gap-x-2 gap-y-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,2.25fr)_minmax(80px,0.65fr)_minmax(100px,0.8fr)] sm:gap-x-3 sm:gap-y-3">
        <span className="col-span-5 min-w-0 truncate text-[13px] font-semibold text-text-dark sm:col-span-1 sm:text-sm">
          {participant.nickname ?? t("learner")}
        </span>
        <span className="col-span-7 min-w-0 truncate text-xs text-text-dark/70 sm:col-span-1 sm:text-sm">
          {participant.email ?? "—"}
        </span>
        <span className="col-span-6 min-w-0 truncate text-[11px] font-medium text-text-dark sm:col-span-1 sm:text-xs">
          <span className="sr-only">{t("checkin_count_label")}: </span>
          {participant.checkinCount}
        </span>
        <span className="col-span-6 min-w-0 truncate text-[11px] font-medium text-text-dark sm:col-span-1 sm:text-xs">
          <span className="sr-only">{t("participant_latest_activity")}: </span>
          {formatDate(participant.lastActivityAt)}
        </span>
      </span>
      {isOpening && checkinsQuery.isLoading && (
        <span className="absolute right-3 top-3">
          <Spinner className="size-4" />
        </span>
      )}
      {openFailed && (
        <output className="mt-2 block text-xs text-red-700">
          {t("participant_practice_open_failed")}
        </output>
      )}
    </button>
  );
}
