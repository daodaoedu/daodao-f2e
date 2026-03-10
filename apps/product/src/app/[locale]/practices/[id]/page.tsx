"use client";

import {
  createComment,
  deleteComment,
  updateComment,
  useArchivePractice,
  useComments,
  useCurrentUser,
  useDeletePractice,
  useMyPractices,
  usePracticeById,
  usePracticeCheckIns,
} from "@daodao/api";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { toast } from "@daodao/ui/components/sonner";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useCallback, useMemo } from "react";
import { CheckInButton } from "@/components/check-in";
import type { IComment, ICommentReply } from "@/components/check-in/reactions";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { PracticeDetailShell } from "@/components/practice";
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

interface IApiCommentUser {
  name?: string;
  photoURL?: string | null;
}

interface IApiCommentNode {
  id: number | string;
  content?: string;
  createdAt?: string;
  user?: IApiCommentUser;
  replies?: unknown[];
}

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

function isApiCommentNode(comment: unknown): comment is IApiCommentNode {
  if (typeof comment !== "object" || comment === null) {
    return false;
  }

  if (!("id" in comment)) {
    return false;
  }

  return true;
}

function formatCommentTime(createdAt?: string): string {
  if (!createdAt) {
    return "剛剛";
  }

  const parsedDate = parseISO(createdAt);
  if (!isValid(parsedDate)) {
    return "剛剛";
  }

  return formatDistanceToNow(parsedDate, {
    addSuffix: true,
    locale: zhTW,
  });
}

function mapReply(reply: IApiCommentNode): ICommentReply {
  return {
    id: String(reply.id),
    author: {
      name: reply.user?.name || "匿名使用者",
      photoURL: reply.user?.photoURL || undefined,
    },
    content: reply.content || "",
    time: formatCommentTime(reply.createdAt),
  };
}

function mapComment(comment: IApiCommentNode): IComment {
  const rawReplies = Array.isArray(comment.replies) ? comment.replies : [];
  const mappedReplies = rawReplies.filter(isApiCommentNode).map(mapReply);

  return {
    id: String(comment.id),
    author: {
      name: comment.user?.name || "匿名使用者",
      photoURL: comment.user?.photoURL || undefined,
    },
    content: comment.content || "",
    time: formatCommentTime(comment.createdAt),
    replies: mappedReplies,
  };
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
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const { data: practiceData, isLoading, error, mutate: mutatePractice } = usePracticeById(practiceId);
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
  const { data: practicesListData } = useMyPractices({ limit: 100 });
  const { data: currentUserData } = useCurrentUser();

  const isOwner = practiceData?.data?.user?.id === currentUserData?.data?.id;
  const { openArchiveDialog } = useArchivePracticeDialog();
  const { openDeleteDialog } = useDeletePracticeDialog();
  const { archivePractice, restorePractice } = useArchivePractice(practiceId);
  const { deletePractice: deletePracticeById } = useDeletePractice(practiceId);

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

    return rawComments.filter(isApiCommentNode).map((comment) => mapComment(comment));
  }, [commentsData]);

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
          toast.success("實踐已成功復原");
        } catch (restoreError) {
          const errorMessage = restoreError instanceof Error ? restoreError.message : "復原失敗";
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
        const errorMessage = archiveError instanceof Error ? archiveError.message : "封存失敗";
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
        const errorMessage = deleteError instanceof Error ? deleteError.message : "刪除失敗";
        console.error("Failed to delete practice:", errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleCommentSubmit = useCallback(
    async (content: string, parentId?: string) => {
      const response = await createComment({
        targetType: "practice",
        targetId: practiceId,
        content,
        visibility: "public",
        parentId: parentId ? Number(parentId) : undefined,
      });

      if (response.error) {
        const errorMessage = getErrorMessage(response.error, "留言失敗");
        console.error("Failed to create comment:", errorMessage);
        toast.error(errorMessage);
        return;
      }

      toast.success("留言成功！");
      await Promise.all([mutateComments(), mutatePractice()]);
    },
    [mutateComments, mutatePractice, practiceId]
  );

  const handleCommentEdit = useCallback(
    async (commentId: string, content: string) => {
      const parsedCommentId = Number(commentId);
      if (!Number.isFinite(parsedCommentId)) {
        toast.error("留言 ID 無效");
        return false;
      }

      const response = await updateComment(parsedCommentId, { content });
      if (response.error) {
        const errorMessage = getErrorMessage(response.error, "更新留言失敗");
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
        toast.error("留言 ID 無效");
        return false;
      }

      const response = await deleteComment(parsedCommentId);
      if (response.error) {
        const errorMessage = getErrorMessage(response.error, "刪除留言失敗");
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
        <PageHeader leftAction="back" leftLabel="" title="主題實踐" rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">載入中...</div>
        </main>
      </div>
    );
  }

  if (error || !practice) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
        <PageHeader leftAction="back" leftLabel="" title="主題實踐" rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">
            {error ? "載入失敗，請稍後再試" : "找不到此實踐"}
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
      <PageHeader leftAction="back" leftLabel="" title="主題實踐" rightActionTo="/" />
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
        currentUserPhotoURL={getCurrentUserPhotoURL(currentUserData?.data)}
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
        onSubmitComment={(content, parentId) => {
          void handleCommentSubmit(content, parentId);
        }}
        onEditComment={handleCommentEdit}
        onDeleteComment={handleCommentDelete}
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
