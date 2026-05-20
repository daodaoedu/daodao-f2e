"use client";

import { posthogCapture } from "@daodao/analytics";
import {
  createComment,
  deleteComment,
  updateComment,
  useArchivePractice,
  useComments,
  useCurrentUser,
  useDeletePractice,
  useMentionCandidates,
  useMyPractices,
  usePracticeById,
  usePracticeCheckIns,
  useReactionsList,
  useRecordView,
} from "@daodao/api";
import type { MentionCandidate } from "@daodao/features-mention";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useParams, useRouter } from "@daodao/i18n/navigation";
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
import type { IComment } from "@/components/check-in/reactions";
import { BackgroundAnimation } from "@/components/layout";
import { PracticeDetailShell } from "@/components/practice";
import { applyOnboardingUpdateFromResponse } from "@/components/task-guide/onboarding-progress-context";
import {
  type DurationDays,
  DurationDays as DurationDaysConst,
  type ExecutionTiming,
  ExecutionTiming as ExecutionTimingConst,
  type Frequency,
  Frequency as FrequencyConst,
  PracticeTimePeriodToExecutionTimingMap,
} from "@/constants/practice-form";
import {
  ArchivePracticeResult,
  useArchivePracticeDialog,
} from "@/hooks/use-archive-practice-dialog";
import { DeletePracticeResult, useDeletePracticeDialog } from "@/hooks/use-delete-practice-dialog";

interface IPracticeDetailData {
  title: string;
  actionDescription: string;
  durationMinutes: number;
  startDate: string;
  durationDays: DurationDays;
  frequency: Frequency;
  executionTiming: ExecutionTiming[];
  customTiming: string;
  tags: string[];
  resources: { id: string; name: string; url?: string }[];
  progress: number;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error !== "object" || error === null) {
    return fallbackMessage;
  }

  if ("details" in error && Array.isArray(error.details) && error.details.length > 0) {
    const firstDetail = error.details[0];
    if (
      typeof firstDetail === "object" &&
      firstDetail !== null &&
      "message" in firstDetail &&
      typeof firstDetail.message === "string"
    ) {
      return firstDetail.message;
    }
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallbackMessage;
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
  const practiceId = params.id as string;
  const {
    data: practiceData,
    isLoading,
    error,
    mutate: mutatePractice,
  } = usePracticeById(practiceId);
  const { data: checkInsData, isLoading: isLoadingCheckIns } = usePracticeCheckIns(practiceId, {
    limit: 30,
  });
  const {
    data: commentsData,
    isLoading: isLoadingComments,
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
  const { data: practicesListData } = useMyPractices({ limit: 100 });
  const { data: currentUserData } = useCurrentUser();
  const { data: reactionsListData } = useReactionsList({
    targetType: "practice",
    targetId: practiceId,
  });

  const isOwner = practiceData?.data?.user?.id === currentUserData?.data?.id;
  const { openArchiveDialog } = useArchivePracticeDialog();
  const { openDeleteDialog } = useDeletePracticeDialog();
  const { archivePractice, restorePractice } = useArchivePractice(practiceId);
  const { deletePractice: deletePracticeById } = useDeletePractice(practiceId);

  const recordView = useRecordView();

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

    let durationDays: DurationDays = DurationDaysConst.seven;
    if (data.durationDays === 14) {
      durationDays = DurationDaysConst.fourteen;
    } else if (data.durationDays === 21) {
      durationDays = DurationDaysConst.twentyOne;
    } else if (data.durationDays === 30) {
      durationDays = DurationDaysConst.thirty;
    }

    const frequencyMin = data.frequencyMinDays ?? 0;
    const frequencyMax = data.frequencyMaxDays ?? 0;
    let frequency: Frequency = FrequencyConst.twoToFour;
    if (frequencyMin === 3 && frequencyMax === 5) {
      frequency = FrequencyConst.threeToFive;
    }
    if (frequencyMin === 4 && frequencyMax === 7) {
      frequency = FrequencyConst.fourToSeven;
    }

    const executionTiming = (data.practiceTimePeriods || [])
      .map((period: string) => PracticeTimePeriodToExecutionTimingMap[period])
      .filter((timing): timing is ExecutionTiming => timing !== undefined);

    const finalExecutionTiming =
      executionTiming.length > 0 ? executionTiming : [ExecutionTimingConst.morning];

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
      resources: (data.resources || []).map((resource) => ({
        id: resource.id,
        name: resource.name,
        url: resource.url,
      })),
      progress: data.progressPercentage ?? 0,
    };
  }, [practiceData]);

  const comments = useMemo(() => {
    const rawComments = commentsData?.data;
    if (!Array.isArray(rawComments)) {
      return [];
    }

    return rawComments.filter(isApiCommentNode).map((comment) =>
      mapComment(comment, commentOptions)
    );
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

  const { previousPracticeId, nextPracticeId, hasPrevious, hasNext } = useMemo(() => {
    const practices = practicesListData?.data || [];
    const currentIndex = practices.findIndex((p) => String(p.id) === practiceId);
    if (currentIndex === -1) {
      return { previousPracticeId: null, nextPracticeId: null, hasPrevious: false, hasNext: false };
    }
    const previousPractice = currentIndex > 0 ? practices[currentIndex - 1] : null;
    const nextPractice = currentIndex < practices.length - 1 ? practices[currentIndex + 1] : null;
    return {
      previousPracticeId: previousPractice ? String(previousPractice.id) : null,
      nextPracticeId: nextPractice ? String(nextPractice.id) : null,
      hasPrevious: previousPractice !== null,
      hasNext: nextPractice !== null,
    };
  }, [practicesListData, practiceId]);

  const handlePrevious = () => {
    if (previousPracticeId) router.push(`/practices/${previousPracticeId}`);
  };

  const handleNext = () => {
    if (nextPracticeId) router.push(`/practices/${nextPracticeId}`);
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
          const errorMessage = restoreError instanceof Error ? restoreError.message : t("restore_failed");
          console.error("Failed to restore practice:", errorMessage);
          toast.error(errorMessage);
        }
      },
    });

    if (result === ArchivePracticeResult.Archived) {
      try {
        await archivePractice();
        router.push("/settings/archived");
      } catch (archiveError) {
        const errorMessage = archiveError instanceof Error ? archiveError.message : t("archive_failed");
        console.error("Failed to archive practice:", errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async () => {
    const result = await openDeleteDialog();
    if (result === DeletePracticeResult.Deleted) {
      try {
        await deletePracticeById();
        router.push("/");
      } catch (deleteError) {
        const errorMessage = deleteError instanceof Error ? deleteError.message : t("delete_failed");
        console.error("Failed to delete practice:", errorMessage);
        toast.error(errorMessage);
      }
    }
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
        const errorMessage = getErrorMessage(response.error, t("comment_failed"));
        console.error("Failed to create comment:", errorMessage);
        toast.error(errorMessage);
        return;
      }

      toast.success(t("comment_success"));
      await Promise.all([mutateComments(), mutatePractice()]);
    },
    [mutateComments, mutatePractice, practiceId]
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
        const errorMessage = getErrorMessage(response.error, t("update_comment_failed"));
        console.error("Failed to update comment:", errorMessage);
        toast.error(errorMessage);
        return false;
      }

      await mutateComments();
      return true;
    },
    [mutateComments]
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
        const errorMessage = getErrorMessage(response.error, t("delete_comment_failed"));
        console.error("Failed to delete comment:", errorMessage);
        toast.error(errorMessage);
        return false;
      }

      await mutateComments();
      return true;
    },
    [mutateComments]
  );

  if (isLoading) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
        <div className="sticky top-0 z-50 max-w-[448px] mx-auto w-full">
          <button
            type="button"
            onClick={() => router.replace("/?tab=mine")}
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
    );
  }

  if (error || !practice) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
        <div className="sticky top-0 z-50 max-w-[448px] mx-auto w-full">
          <button
            type="button"
            onClick={() => router.replace("/?tab=mine")}
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
    );
  }

  let creatorDate: string | undefined;
  if (!isOwner && practiceData?.data?.startDate) {
    const parsedStartDate = parseISO(practiceData.data.startDate);
    if (isValid(parsedStartDate)) {
      creatorDate = format(parsedStartDate, "yyyy/MM/dd");
    }
  }

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
      <div className="sticky top-0 z-50 max-w-[448px] mx-auto w-full">
        <button
          type="button"
          onClick={() => router.replace("/?tab=mine")}
          className="absolute top-2 right-2 flex items-center justify-center size-10 rounded-full text-light-gray bg-very-light-gray/50 hover:text-logo-cyan"
          aria-label={t("close")}
        >
          <X className="size-6" />
        </button>
      </div>
      <BackgroundAnimation />

      <PracticeDetailShell
        practice={{
          id: practiceId,
          title: practice.title,
          status: practiceData?.data?.status,
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
                }
              : undefined,
          resources: practice.resources,
        }}
        practiceId={practiceId}
        isOwner={isOwner}
        checkInsData={checkInsData}
        isLoadingCheckIns={isLoadingCheckIns}
        isLoadingComments={isLoadingComments}
        comments={comments}
        currentUserName={currentUserData?.data?.name || undefined}
        currentUserId={currentUserData?.data?.id || undefined}
        currentUserPhotoURL={getCurrentUserPhotoURL(currentUserData?.data)}
        mentionCandidates={mentionCandidates}
        commentCount={practiceData?.data?.stats?.commentCount}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
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
            <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray z-20">
              <CheckInButton
                variant="orange"
                className="w-full sm:max-w-[288px]"
                practiceId={practiceId}
                practiceStatus={practiceData?.data?.status}
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
  );
}
