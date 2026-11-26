"use client";

import { posthogCapture } from "@daodao/analytics";
import {
  createComment,
  deleteComment,
  updateComment,
  updatePractice,
  useAllPracticeCheckIns,
  useArchivePractice,
  useComments,
  useCurrentUser,
  useDeletePractice,
  useLighthouseParticipantCheckins,
  useMentionCandidates,
  usePracticeById,
  usePracticeCheckIns,
  useReactionsList,
  useRecordReadProgress,
  useRecordTimeSpent,
  useRecordView,
} from "@daodao/api";
import type { MentionCandidate } from "@daodao/features-mention";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useParams, useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { toast } from "@daodao/ui/components/sonner";
import { format, isValid, parseISO } from "date-fns";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { CheckInButton } from "@/components/check-in";
import {
  type CommentFormatOptions,
  formatCommentTime,
  getDateFnsLocale,
  isApiCommentNode,
  mapComment,
} from "@/components/check-in/display/check-in-detail";
import { BackgroundAnimation, WithLayoutFrame } from "@/components/layout";
import { PracticeDetailShell } from "@/components/practice";
import { CohortParticipantNav } from "@/components/practice/detail/cohort-participant-nav";
import { PRACTICE_DETAIL_CLOSE_PATH } from "@/constants/home-navigation";
import {
  type ExecutionTiming,
  ExecutionTiming as ExecutionTimingConst,
  PracticeTimePeriodToExecutionTimingMap,
} from "@/constants/practice-form";
import {
  ArchivePracticeResult,
  useArchivePracticeDialog,
} from "@/hooks/use-archive-practice-dialog";
import { DeletePracticeResult, useDeletePracticeDialog } from "@/hooks/use-delete-practice-dialog";
import { parseCohortParticipantRefs } from "@/lib/cohort-participant-context";
import { isPracticeCopyRestricted } from "@/lib/practice-copy-policy";
import { runDeletePracticeFlow } from "@/lib/practice-delete/run-delete-practice-flow";
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";
import { countTotalComments } from "@/utils/count-comments";
import { formatFrequencyRange } from "@/utils/practice-edit-schedule";
import { resolvePracticeDurationDays } from "@/utils/practice-period";
import { getCohortPracticeDisplayStatus } from "@/utils/practice-schedule-lock";

interface IPracticeDetailData {
  title: string;
  actionDescription: string;
  durationMinutes: number;
  startDate: string;
  durationDays: number | null;
  /** 每週頻率，例 "1-3"、"7"；"" = 沒有設定 */
  frequency: string;
  executionTiming: ExecutionTiming[];
  customTiming: string;
  tags: string[];
  resources: {
    id: string;
    name: string;
    url?: string;
    dayNumber?: number | null;
    relevantDate?: string | null;
    isLocked?: boolean;
  }[];
  progress: number;
}

function isMentionCandidateWithNumericId(
  candidate: unknown
): candidate is MentionCandidate & { numericUserId: number } {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    "userId" in candidate &&
    "numericUserId" in candidate &&
    "name" in candidate &&
    typeof candidate.userId === "string" &&
    typeof candidate.numericUserId === "number" &&
    typeof candidate.name === "string"
  );
}

function getCurrentUserPhotoURL(currentUser: unknown): string | undefined {
  if (typeof currentUser !== "object" || currentUser === null) {
    return undefined;
  }

  if ("photoURL" in currentUser && typeof currentUser.photoURL === "string") {
    return currentUser.photoURL;
  }

  if ("photoUrl" in currentUser && typeof currentUser.photoUrl === "string") {
    return currentUser.photoUrl;
  }

  return undefined;
}

export default function PracticeDetailPage() {
  const t = useTranslations("practice");
  const { errorMessage: serverErrorMessage } = useServerErrorMessage();
  const locale = useLocale();
  const commentOptions = useMemo<CommentFormatOptions>(
    () => ({
      anonymousLabel: t("anonymous_user"),
      justNowLabel: t("just_now"),
      locale: getDateFnsLocale(locale),
    }),
    [t, locale]
  );
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const practiceId = params.id as string;
  const requestedCohortAdminView = searchParams.get("view") === "cohort-admin";
  const isCohortMemberView = searchParams.get("view") === "cohort-member";
  const cohortProgramId = Number(searchParams.get("programId"));
  const cohortId = Number(searchParams.get("cohortId"));
  const cohortParticipantRefs = parseCohortParticipantRefs(searchParams.get("members"));
  const cohortMemberIndex = Number(searchParams.get("memberIndex"));
  const hasValidCohortParticipantContext =
    requestedCohortAdminView &&
    searchParams.has("memberIndex") &&
    Number.isSafeInteger(cohortProgramId) &&
    cohortProgramId > 0 &&
    Number.isSafeInteger(cohortId) &&
    cohortId > 0 &&
    Number.isSafeInteger(cohortMemberIndex) &&
    cohortMemberIndex >= 0 &&
    cohortMemberIndex < cohortParticipantRefs.length;
  const currentParticipant = hasValidCohortParticipantContext
    ? cohortParticipantRefs[cohortMemberIndex]
    : undefined;
  // The URL is navigation state. This server-authorized object lookup proves the
  // current organization/cohort/participant/practice before showing manager UI.
  const currentParticipantCheckins = useLighthouseParticipantCheckins(
    hasValidCohortParticipantContext ? cohortProgramId : undefined,
    hasValidCohortParticipantContext ? cohortId : undefined,
    currentParticipant?.userId,
    currentParticipant?.practiceId
  );
  const isCheckingCohortAdminAccess =
    hasValidCohortParticipantContext &&
    !currentParticipantCheckins.data &&
    !currentParticipantCheckins.error &&
    !currentParticipantCheckins.validationError;
  const isReadOnlyCohortView =
    !currentParticipantCheckins.error &&
    !currentParticipantCheckins.validationError &&
    currentParticipantCheckins.data?.data.practice.externalId === practiceId;
  const hasCohortParticipantContext = hasValidCohortParticipantContext && isReadOnlyCohortView;
  const nextCohortParticipant = hasCohortParticipantContext
    ? cohortParticipantRefs[cohortMemberIndex + 1]
    : undefined;
  const previousCohortParticipant = hasCohortParticipantContext
    ? cohortParticipantRefs[cohortMemberIndex - 1]
    : undefined;
  const nextParticipantCheckins = useLighthouseParticipantCheckins(
    hasCohortParticipantContext ? cohortProgramId : undefined,
    hasCohortParticipantContext ? cohortId : undefined,
    nextCohortParticipant?.userId,
    nextCohortParticipant?.practiceId
  );
  const previousParticipantCheckins = useLighthouseParticipantCheckins(
    hasCohortParticipantContext ? cohortProgramId : undefined,
    hasCohortParticipantContext ? cohortId : undefined,
    previousCohortParticipant?.userId,
    previousCohortParticipant?.practiceId
  );
  const nextCohortPracticeExternalId = nextParticipantCheckins.data?.data.practice.externalId;
  const previousCohortPracticeExternalId =
    previousParticipantCheckins.data?.data.practice.externalId;
  let cohortListingHref: string | undefined;
  if (isReadOnlyCohortView && cohortProgramId > 0 && cohortId > 0) {
    cohortListingHref = `/cohorts/${cohortId}?programId=${cohortProgramId}`;
  } else if (isCohortMemberView && cohortId > 0) {
    cohortListingHref = `/cohorts/${cohortId}`;
  }
  const handleClose = () => {
    if (cohortListingHref) {
      router.push(cohortListingHref);
      return;
    }
    router.replace(PRACTICE_DETAIL_CLOSE_PATH);
  };
  const {
    data: practiceData,
    isLoading,
    error,
    mutate: mutatePractice,
  } = usePracticeById(practiceId);
  const standardCheckIns = usePracticeCheckIns(practiceId, { limit: 30 }, !isReadOnlyCohortView);
  const allCheckIns = useAllPracticeCheckIns(practiceId, isReadOnlyCohortView);
  const checkInsQuery = isReadOnlyCohortView ? allCheckIns : standardCheckIns;
  const checkInsData = checkInsQuery.data;
  const isLoadingCheckIns = checkInsQuery.isLoading;
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    error: commentsError,
    mutate: mutateComments,
  } = useComments({
    targetType: "practice",
    targetId: practiceId,
  });
  const { data: mentionCandidatesData } = useMentionCandidates({
    targetType: "practice",
    targetId: practiceId,
    limit: 50,
  });
  const { data: currentUserData } = useCurrentUser();
  const { data: reactionsListData } = useReactionsList({
    targetType: "practice",
    targetId: practiceId,
  });

  // Visitor preview only removes owner controls; API permissions remain unchanged.
  const isOwner =
    searchParams.get("view") !== "visitor" &&
    !!currentUserData?.data?.id &&
    practiceData?.data?.user?.id === currentUserData.data.id;
  const isCohortPractice =
    practiceData?.data?.isCohortPractice === true && practiceData?.data?.isChallenge !== true;
  const practiceStatus = getCohortPracticeDisplayStatus(
    practiceData?.data?.status,
    isCohortPractice,
    {
      startDate: practiceData?.data?.startDate,
      endDate: practiceData?.data?.endDate,
    }
  );
  const tCohort = useTranslations("cohort");
  // 場次實踐在 DB 仍是草稿：比照場次卡片，打卡前先啟用（daodao#544）
  const activateCohortDraft = useCallback(async (): Promise<boolean> => {
    try {
      const response = await updatePractice(practiceId, { status: "active", isDraft: false });
      if (response.error) {
        toast.error(
          serverErrorMessage(response.error, tCohort("activate_failed"), {
            status: response.response.status,
          })
        );
        return false;
      }
      await mutatePractice();
      return true;
    } catch {
      toast.error(tCohort("activate_failed"));
      return false;
    }
  }, [practiceId, mutatePractice, serverErrorMessage, tCohort]);
  const { openArchiveDialog } = useArchivePracticeDialog();
  const { openDeleteDialog } = useDeletePracticeDialog();
  const { archivePractice, restorePractice } = useArchivePractice(practiceId);
  const { deletePractice: deletePracticeById } = useDeletePractice(practiceId);

  const recordView = useRecordView();
  useRecordReadProgress(practiceId);
  const { stop: stopTimeSpent } = useRecordTimeSpent(practiceId);

  useEffect(() => {
    if (practiceId) {
      recordView("practice", practiceId);
      posthogCapture("content_viewed", {
        entity_type: "practice",
        entity_id: practiceId,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        platform: "web",
      });
    }
    // recordView 是 useCallback 空 deps，referrer 取自 mount 時的 document，故意只跑一次
  }, [practiceId, recordView]); // eslint-disable-line react-hooks/exhaustive-deps

  const practice: IPracticeDetailData | null = useMemo(() => {
    if (!practiceData?.data) {
      return null;
    }

    const data = practiceData.data;

    // 天數照 API（含共同挑戰複製出的任意天數），不再只認 7／14／21／30（daodao#299）
    const durationDays = resolvePracticeDurationDays(data);

    // 頻率照 API 顯示（例 1-3、7），不再只認 3-5、4-7、其他一律 2-4（daodao#370）
    const frequency = formatFrequencyRange(data.frequencyMinDays, data.frequencyMaxDays);

    const executionTiming = (data.practiceTimePeriods || [])
      .map((period: string) => PracticeTimePeriodToExecutionTimingMap[period])
      .filter((timing): timing is ExecutionTiming => timing !== undefined);

    const finalExecutionTiming =
      executionTiming.length > 0 ? executionTiming : [ExecutionTimingConst.morning];

    const resources = (data.resources || []).map((resource) => {
      const dayNumber = "dayNumber" in resource ? resource.dayNumber : null;
      const isLocked = "isLocked" in resource && resource.isLocked === true;
      return {
        id: resource.id,
        name: resource.name,
        url: resource.url,
        dayNumber: !isLocked && typeof dayNumber === "number" ? dayNumber : null,
        relevantDate:
          "relevantDate" in resource && typeof resource.relevantDate === "string"
            ? resource.relevantDate
            : null,
        isLocked,
      };
    });
    const demoResources =
      process.env.NODE_ENV === "development" &&
      isReadOnlyCohortView &&
      practiceId === "cadd5f3b-4874-4a45-8d95-8b36f0515b10" &&
      resources.length === 0
        ? [
            {
              id: "demo-focus-timer",
              name: "番茄鐘專注計時器",
              url: "https://pomofocus.io/",
              dayNumber: null,
              relevantDate: null,
              isLocked: false,
            },
          ]
        : [];

    return {
      title: data.title,
      actionDescription: data.practiceAction || "",
      durationMinutes: data.sessionDurationMinutes ?? 0,
      startDate: data.startDate || "",
      durationDays,
      frequency,
      executionTiming: finalExecutionTiming,
      customTiming: data.otherContext || "",
      tags: data.tags || [],
      resources: resources.length > 0 ? resources : demoResources,
      progress: data.progressPercentage ?? 0,
    };
  }, [practiceData, isReadOnlyCohortView, practiceId]);

  const comments = useMemo(() => {
    const rawComments = commentsData?.data;
    if (!Array.isArray(rawComments)) {
      return [];
    }

    return rawComments
      .filter(isApiCommentNode)
      .map((comment) => mapComment(comment, commentOptions));
  }, [commentsData, commentOptions]);

  const mentionCandidates = useMemo<MentionCandidate[]>(() => {
    const rawCandidates = (mentionCandidatesData as { data?: unknown[] } | undefined)?.data;
    if (!Array.isArray(rawCandidates)) {
      return [];
    }

    return rawCandidates.filter(isMentionCandidateWithNumericId).map((candidate) => ({
      userId: candidate.userId,
      numericUserId: candidate.numericUserId,
      name: candidate.name,
      photoURL: candidate.photoURL ?? undefined,
      customId: candidate.customId ?? undefined,
    }));
  }, [mentionCandidatesData]);

  const getCohortParticipantPracticeHref = (externalId: string, memberIndex: number) => {
    const nextParams = new URLSearchParams({
      view: "cohort-admin",
      programId: String(cohortProgramId),
      cohortId: String(cohortId),
      members: cohortParticipantRefs
        .map(({ userId, practiceId: lighthousePracticeId }) => `${userId}:${lighthousePracticeId}`)
        .join(","),
      memberIndex: String(memberIndex),
    });
    return `/practices/${externalId}?${nextParams.toString()}`;
  };
  const handleNextCohortParticipant = () => {
    if (!nextCohortPracticeExternalId) return;
    router.push(
      getCohortParticipantPracticeHref(nextCohortPracticeExternalId, cohortMemberIndex + 1)
    );
  };
  const handlePreviousCohortParticipant = () => {
    if (!previousCohortPracticeExternalId) return;
    router.push(
      getCohortParticipantPracticeHref(previousCohortPracticeExternalId, cohortMemberIndex - 1)
    );
  };

  const handleEdit = () => {
    router.push(`/practices/${practiceId}/edit`);
  };

  const handleArchive = async () => {
    const result = await openArchiveDialog({
      onRestore: async () => {
        try {
          await restorePractice();
          toast.success(t("restore_success"));
        } catch (restoreError) {
          console.error("Failed to restore practice:", restoreError);
          toast.error(serverErrorMessage(restoreError, t("restore_failed")));
        }
      },
    });

    if (result === ArchivePracticeResult.Archived) {
      try {
        await archivePractice();
        router.push("/settings/archived");
      } catch (archiveError) {
        console.error("Failed to archive practice:", archiveError);
        toast.error(serverErrorMessage(archiveError, t("archive_failed")));
      }
    }
  };

  const handleDelete = async () => {
    await runDeletePracticeFlow({
      confirm: async () => (await openDeleteDialog()) === DeletePracticeResult.Confirmed,
      deletePractice: deletePracticeById,
      onDeleted: () => {
        // 實踐已不存在，跳頁 unmount 時不要再回報停留時間（會 404）
        stopTimeSpent();
        toast.success(t("delete_success"));
        router.push("/");
      },
      onError: (deleteError) => {
        console.error("Failed to delete practice:", deleteError);
        toast.error(serverErrorMessage(deleteError, t("delete_failed")));
      },
    });
  };

  const handleCommentSubmit = useCallback(
    async (content: string, parentId?: string, mentionedUserIds?: number[]) => {
      const response = await createComment({
        targetType: "practice",
        targetId: practiceId,
        content,
        visibility: "public",
        parentId: parentId ? Number(parentId) : undefined,
        mentionedUserIds: mentionedUserIds?.length ? mentionedUserIds : undefined,
      });

      if (response.error) {
        console.error("Failed to create comment:", response.error);
        toast.error(
          serverErrorMessage(response.error, t("comment_failed"), {
            status: response.response.status,
          })
        );
        return;
      }

      toast.success(t("comment_success"));
      await Promise.all([mutateComments(), mutatePractice()]);
    },
    [mutateComments, mutatePractice, practiceId, serverErrorMessage, t]
  );

  const handleCommentEdit = useCallback(
    async (commentId: string, content: string, mentionedUserIds?: number[]) => {
      const parsedCommentId = Number(commentId);
      if (!Number.isFinite(parsedCommentId)) {
        toast.error(t("comment_id_invalid"));
        return false;
      }

      const response = await updateComment(parsedCommentId, {
        content,
        mentionedUserIds: mentionedUserIds?.length ? mentionedUserIds : undefined,
      });
      if (response.error) {
        console.error("Failed to update comment:", response.error);
        toast.error(
          serverErrorMessage(response.error, t("update_comment_failed"), {
            status: response.response.status,
          })
        );
        return false;
      }

      await mutateComments();
      return true;
    },
    [mutateComments, serverErrorMessage, t]
  );

  const handleCommentDelete = useCallback(
    async (commentId: string) => {
      const parsedCommentId = Number(commentId);
      if (!Number.isFinite(parsedCommentId)) {
        toast.error(t("comment_id_invalid"));
        return false;
      }

      const response = await deleteComment(parsedCommentId);
      if (response.error) {
        console.error("Failed to delete comment:", response.error);
        toast.error(
          serverErrorMessage(response.error, t("delete_comment_failed"), {
            status: response.response.status,
          })
        );
        return false;
      }

      await mutateComments();
      return true;
    },
    [mutateComments, serverErrorMessage, t]
  );

  if (isLoading || isCheckingCohortAdminAccess) {
    return (
      <WithLayoutFrame>
        <div className="relative w-full min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
          <div className="sticky top-0 z-50 max-w-[448px] mx-auto w-full">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-2 right-2 flex items-center justify-center size-10 rounded-full text-light-gray bg-very-light-gray/50 hover:text-logo-cyan"
              aria-label={t("close")}
            >
              <X className="size-6" />
            </button>
          </div>
          <BackgroundAnimation />
          <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
            <div className="text-center text-text-dark">{t("loading")}</div>
          </main>
        </div>
      </WithLayoutFrame>
    );
  }

  if (error || !practice) {
    return (
      <WithLayoutFrame>
        <div className="relative w-full min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
          <div className="sticky top-0 z-50 max-w-[448px] mx-auto w-full">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-2 right-2 flex items-center justify-center size-10 rounded-full text-light-gray bg-very-light-gray/50 hover:text-logo-cyan"
              aria-label={t("close")}
            >
              <X className="size-6" />
            </button>
          </div>
          <BackgroundAnimation />
          <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
            <div className="text-center text-text-dark">
              {error ? t("load_failed") : t("not_found")}
            </div>
          </main>
        </div>
      </WithLayoutFrame>
    );
  }

  let creatorDate: string | undefined;
  if (!isOwner && practiceData?.data?.startDate) {
    const parsedStartDate = parseISO(practiceData.data.startDate);
    if (isValid(parsedStartDate)) creatorDate = format(parsedStartDate, "yyyy/MM/dd");
  }

  return (
    <WithLayoutFrame>
      <div className="relative w-full min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
        {hasCohortParticipantContext && cohortListingHref ? (
          <CohortParticipantNav
            backHref={cohortListingHref}
            backLabel={t("back_to_cohort")}
            navLabel={t("participant_navigation")}
            participantName={practiceData?.data?.user?.name}
            current={cohortMemberIndex + 1}
            total={cohortParticipantRefs.length}
            onPrevious={handlePreviousCohortParticipant}
            onNext={handleNextCohortParticipant}
            previousDisabled={!previousCohortPracticeExternalId}
            nextDisabled={!nextCohortPracticeExternalId}
            previousLabel={t("previous_participant_practice")}
            nextLabel={t("next_participant_practice")}
          />
        ) : (
          <div className="sticky top-0 z-50 mx-auto w-full max-w-[1440px] px-2 md:px-8">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-2 right-2 flex items-center justify-center size-10 rounded-full text-light-gray bg-very-light-gray/50 hover:text-logo-cyan"
              aria-label={t("close")}
            >
              <X className="size-6" />
            </button>
          </div>
        )}
        <BackgroundAnimation />

        <PracticeDetailShell
          hasTopBar={hasCohortParticipantContext && Boolean(cohortListingHref)}
          practice={{
            id: practiceId,
            title: practice.title,
            isChallenge: practiceData?.data?.isChallenge === true,
            isCopyRestricted: practiceData?.data
              ? isPracticeCopyRestricted(practiceData.data)
              : false,
            isCohortPractice:
              practiceData?.data?.isCohortPractice === true ||
              isReadOnlyCohortView ||
              isCohortMemberView,
            status: practiceStatus,
            actionDescription: practice.actionDescription,
            frequency: practice.frequency,
            durationMinutes: practice.durationMinutes,
            durationDays: practice.durationDays,
            startDate: practice.startDate,
            executionTiming: practice.executionTiming,
            customTiming: practice.customTiming,
            tags: practice.tags,
            progress: practice.progress,
            creator:
              !isOwner && practiceData?.data?.user
                ? {
                    id: practiceData.data.user.id,
                    name: practiceData.data.user.name,
                    photoURL: practiceData.data.user.photoURL,
                    date: creatorDate,
                    customId:
                      (practiceData.data.user as { customId?: string | null }).customId ??
                      undefined,
                  }
                : undefined,
            resources: practice.resources,
          }}
          practiceId={practiceId}
          isOwner={isOwner}
          readOnly={isReadOnlyCohortView}
          checkInsData={checkInsData}
          isLoadingCheckIns={isLoadingCheckIns}
          checkInsError={isReadOnlyCohortView && Boolean(allCheckIns.error)}
          onRetryCheckIns={() => {
            void allCheckIns.mutate();
          }}
          isLoadingComments={isLoadingComments}
          commentsError={Boolean(commentsError)}
          onRetryComments={() => {
            void mutateComments();
          }}
          comments={comments}
          currentUserName={currentUserData?.data?.name || undefined}
          currentUserId={currentUserData?.data?.id || undefined}
          currentUserPhotoURL={getCurrentUserPhotoURL(currentUserData?.data)}
          mentionCandidates={mentionCandidates}
          commentCount={
            Array.isArray(commentsData?.data)
              ? countTotalComments(commentsData.data.filter(isApiCommentNode))
              : practiceData?.data?.stats?.commentCount
          }
          onEditPractice={handleEdit}
          onArchivePractice={() => {
            void handleArchive();
          }}
          onDeletePractice={() => {
            void handleDelete();
          }}
          onSubmitComment={(content, parentId, mentionedUserIds) => {
            void handleCommentSubmit(content, parentId, mentionedUserIds);
          }}
          onEditComment={handleCommentEdit}
          onDeleteComment={handleCommentDelete}
          browseActivity={{
            viewCount: practiceData?.data?.stats?.viewCount,
            followers: (reactionsListData?.data?.items ?? []).map((item) => ({
              id: item.userId,
              name: item.name,
              photoURL: item.photoURL ?? undefined,
              time: formatCommentTime(item.reactedAt, commentOptions),
              following: false,
              reaction: item.reactionType as "useful" | "fire" | "touched" | "curious",
            })),
          }}
          footer={
            isOwner ? (
              <footer className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 flex justify-center gap-6 border-t border-light-gray bg-very-light-gray p-6 z-20 md:bottom-0">
                <CheckInButton
                  variant="orange"
                  className="w-full sm:max-w-[288px]"
                  practiceId={practiceId}
                  isChallenge={practiceData?.data?.isChallenge === true}
                  practiceStatus={practiceStatus}
                  disableBeforeStartDate={isCohortPractice}
                  beforeCheckIn={
                    isCohortPractice && practiceData?.data?.status === "draft"
                      ? activateCohortDraft
                      : undefined
                  }
                  lastCheckInDate={checkInsData?.data?.[0]?.createdAt || undefined}
                  startDate={practice.startDate}
                  endDate={practiceData?.data?.endDate}
                  taskTitle={practice.title}
                  progressPercentage={practice.progress}
                />
              </footer>
            ) : null
          }
        />
      </div>
    </WithLayoutFrame>
  );
}
