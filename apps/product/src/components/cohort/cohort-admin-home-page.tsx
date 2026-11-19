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
import { useEffect, useState } from "react";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { CohortErrorState } from "@/components/lighthouse/cohort-error-state";
import {
  buildCohortAdminRoster,
  type IRosterParticipant,
  RosterPracticeStatus,
  type RosterSortDirectionType,
  type RosterSortFieldType,
} from "@/lib/cohort-admin-roster";

const ALL_PRACTICES = "__all_practices__";

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
  const [sortField, setSortField] = useState<RosterSortFieldType>("name");
  const [sortDirection, setSortDirection] = useState<RosterSortDirectionType>("asc");
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
  const joinedUserIds = new Set(joinedEnrollments.map((enrollment) => enrollment.userId));
  const joinedPracticeRows =
    participants?.items.filter((item) => joinedUserIds.has(item.userId)) ?? [];
  const practiceTitles = Array.from(
    new Set(joinedPracticeRows.map((item) => item.practiceTitle))
  ).sort((a, b) => a.localeCompare(b));
  const practiceDataError =
    participantsQuery.error ||
    participantsQuery.validationError ||
    outcomeQuery.error ||
    outcomeQuery.validationError;
  let practiceStatus: "loading" | "error" | "ready" = RosterPracticeStatus.ready;
  if (practiceDataError) practiceStatus = RosterPracticeStatus.error;
  else if (participantsQuery.isLoading || outcomeQuery.isLoading) {
    practiceStatus = RosterPracticeStatus.loading;
  }
  const participantCards = buildCohortAdminRoster({
    enrollments: enrollments ?? [],
    practices: joinedPracticeRows,
    activity: outcome?.participantProgress ?? [],
    practiceStatus,
    selectedPractice: selectedPractice === ALL_PRACTICES ? undefined : selectedPractice,
    search,
    sortField,
    sortDirection,
  });
  const participantRefs = participantCards.flatMap((participant) =>
    participant.practiceStatus === RosterPracticeStatus.ready &&
    participant.userId !== null &&
    participant.practiceId !== null
      ? [{ userId: participant.userId, practiceId: participant.practiceId }]
      : []
  );
  const retryPracticeData = () => {
    void participantsQuery.mutate();
    void outcomeQuery.mutate();
  };
  const toggleSort = (field: Exclude<RosterSortFieldType, "name">) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("desc");
  };
  const sortableColumns = [
    { field: "checkins", label: t("checkin_count_label") },
    { field: "activity", label: t("participant_latest_activity") },
  ] as const;
  const isLoading = cohortQuery.isLoading || enrollmentQuery.isLoading;
  const hasError =
    cohortQuery.error ||
    cohortQuery.validationError ||
    enrollmentQuery.error ||
    enrollmentQuery.validationError;

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
                <CustomLink
                  href={`/lighthouse/programs/${programId}/cohorts/${cohortId}/dashboard`}
                >
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

            {practiceDataError && (
              <output className="mb-4 flex flex-wrap items-center gap-2 text-sm text-text-dark">
                <span>{t("participant_practices_load_failed")}</span>
                <Button type="button" variant="outline" size="sm" onClick={retryPracticeData}>
                  {t("retry")}
                </Button>
              </output>
            )}
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
                  <span className="col-span-7 whitespace-nowrap sm:col-span-1">
                    {lighthouseT("col_email")}
                  </span>
                  {sortableColumns.map(({ field, label }) => (
                    <span key={field} className="col-span-6 whitespace-nowrap sm:col-span-1">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-sm hover:text-text-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
                        onClick={() => toggleSort(field)}
                        aria-label={`Sort by ${label}`}
                        aria-pressed={sortField === field}
                      >
                        {label}
                        {sortField === field ? (
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
                  ))}
                </div>
                <ul className="grid gap-3">
                  {participantCards.map((participant) => (
                    <li
                      key={`${participant.enrollmentId}:${participant.practiceId ?? "unavailable"}`}
                    >
                      <CohortAdminParticipantCard
                        participant={participant}
                        participantRefs={participantRefs}
                        onRetryPracticeData={retryPracticeData}
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

const PracticeOpenStatus = {
  idle: "idle",
  loading: "loading",
  retrying: "retrying",
  error: "error",
  unavailable: "unavailable",
} as const;
type PracticeOpenStatusType = (typeof PracticeOpenStatus)[keyof typeof PracticeOpenStatus];

function CohortAdminParticipantCard({
  participant,
  participantRefs,
  programId,
  cohortId,
  onRetryPracticeData,
}: {
  participant: IRosterParticipant;
  participantRefs: { userId: number; practiceId: number }[];
  programId: number;
  cohortId: number;
  onRetryPracticeData: () => void;
}) {
  const t = useTranslations("cohort");
  const router = useRouter();
  const [lookupEnabled, setLookupEnabled] = useState(false);
  const [openStatus, setOpenStatus] = useState<PracticeOpenStatusType>(PracticeOpenStatus.idle);
  const checkinsQuery = useLighthouseParticipantCheckins(
    programId,
    cohortId,
    lookupEnabled ? (participant.userId ?? undefined) : undefined,
    lookupEnabled ? (participant.practiceId ?? undefined) : undefined
  );
  const externalPracticeId = checkinsQuery.data?.data.practice.externalId;
  const hasOpenError = checkinsQuery.error || checkinsQuery.validationError;
  const isOpening =
    openStatus === PracticeOpenStatus.loading || openStatus === PracticeOpenStatus.retrying;
  const isUnavailable =
    participant.practiceStatus === RosterPracticeStatus.unavailable ||
    openStatus === PracticeOpenStatus.unavailable;
  const canOpen =
    participant.practiceStatus === RosterPracticeStatus.ready &&
    participant.userId !== null &&
    participant.practiceId !== null &&
    !isUnavailable;

  useEffect(() => {
    // Retry awaits revalidation before inspecting data, so a cached error cannot end it early.
    if (openStatus !== PracticeOpenStatus.loading || checkinsQuery.isLoading) return;
    if (hasOpenError) {
      setOpenStatus(PracticeOpenStatus.error);
      return;
    }
    if (externalPracticeId) {
      setOpenStatus(PracticeOpenStatus.idle);
      const participantIndex = participantRefs.findIndex(
        (item) => item.userId === participant.userId && item.practiceId === participant.practiceId
      );
      const params = new URLSearchParams({
        view: "cohort-admin",
        programId: String(programId),
        cohortId: String(cohortId),
        members: participantRefs
          .map(({ userId, practiceId }) => `${userId}:${practiceId}`)
          .join(","),
        memberIndex: String(participantIndex),
      });
      router.push(`/practices/${externalPracticeId}?${params.toString()}`);
      return;
    }
    if (checkinsQuery.data) setOpenStatus(PracticeOpenStatus.unavailable);
  }, [
    checkinsQuery.data,
    checkinsQuery.isLoading,
    cohortId,
    externalPracticeId,
    hasOpenError,
    openStatus,
    participant.practiceId,
    participant.userId,
    participantRefs,
    programId,
    router,
  ]);

  const openPractice = async () => {
    if (!canOpen || isOpening) return;
    if (!lookupEnabled) {
      setLookupEnabled(true);
      setOpenStatus(PracticeOpenStatus.loading);
      return;
    }
    setOpenStatus(PracticeOpenStatus.retrying);
    try {
      await checkinsQuery.mutate();
      setOpenStatus(PracticeOpenStatus.loading);
    } catch {
      setOpenStatus(PracticeOpenStatus.error);
    }
  };

  let statusMessage: string | undefined;
  if (participant.practiceStatus === RosterPracticeStatus.loading) {
    statusMessage = t("participant_practice_loading");
  } else if (participant.practiceStatus === RosterPracticeStatus.error) {
    statusMessage = t("participant_practices_load_failed");
  } else if (isUnavailable) {
    statusMessage = t("participant_practice_unavailable");
  } else if (openStatus === PracticeOpenStatus.error) {
    statusMessage = t("participant_practice_open_failed");
  }

  return (
    <div className="rounded-xl border border-[#DCEBEA] bg-white shadow-sm">
      <Button
        type="button"
        variant="ghost"
        className="relative h-auto w-full rounded-xl px-4 py-3 text-left whitespace-normal hover:bg-[#F0F9F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan disabled:opacity-100 sm:px-5 sm:py-4"
        aria-label={t("open_participant_practice", {
          name: participant.nickname ?? t("learner"),
        })}
        aria-busy={isOpening || participant.practiceStatus === RosterPracticeStatus.loading}
        disabled={!canOpen || isOpening}
        onClick={() => void openPractice()}
      >
        <span className="grid w-full grid-cols-12 items-center leading-normal gap-x-2 gap-y-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,2.25fr)_minmax(80px,0.65fr)_minmax(100px,0.8fr)] sm:gap-x-3 sm:gap-y-3">
          <span className="col-span-5 min-w-0 truncate text-[13px] font-semibold text-text-dark sm:col-span-1 sm:text-sm">
            {participant.nickname ?? t("learner")}
          </span>
          <span className="col-span-7 min-w-0 truncate text-xs text-text-dark/70 sm:col-span-1 sm:text-sm">
            {participant.email ?? "—"}
          </span>
          <span className="col-span-6 min-w-0 truncate text-[11px] font-medium text-text-dark sm:col-span-1 sm:text-xs">
            <span className="sr-only">{t("checkin_count_label")}: </span>
            {participant.checkinCount ?? "—"}
          </span>
          <span className="col-span-6 min-w-0 truncate text-[11px] font-medium text-text-dark sm:col-span-1 sm:text-xs">
            <span className="sr-only">{t("participant_latest_activity")}: </span>
            {formatDate(participant.lastActivityAt)}
          </span>
        </span>
        {isOpening && (
          <span className="absolute right-3 top-3">
            <Spinner className="size-4" />
          </span>
        )}
      </Button>
      {statusMessage && (
        <output className="flex flex-wrap items-center gap-2 px-4 pb-3 text-xs text-text-dark/70 sm:px-5">
          <span>{statusMessage}</span>
          {participant.practiceStatus === RosterPracticeStatus.error && (
            <Button type="button" variant="outline" size="sm" onClick={onRetryPracticeData}>
              {t("retry")}
            </Button>
          )}
          {openStatus === PracticeOpenStatus.error && canOpen && (
            <Button type="button" variant="outline" size="sm" onClick={() => void openPractice()}>
              {t("retry")}
            </Button>
          )}
        </output>
      )}
    </div>
  );
}
