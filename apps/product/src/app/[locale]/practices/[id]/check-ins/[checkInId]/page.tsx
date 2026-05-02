"use client";

import {
  createComment,
  deleteComment,
  removeReaction,
  updateComment,
  upsertReaction,
  useComments,
  useCurrentUser,
  usePracticeById,
  usePracticeCheckIns,
  useReactions,
  useUpdatePracticeCheckIn,
} from "@daodao/api";
import type { ReactionTypeValue } from "@daodao/api";
import { Deco4Svg } from "@daodao/assets";
import { useParams } from "@daodao/i18n/navigation";
import { toast } from "@daodao/ui/components/sonner";
import { addDays, format, formatDistanceToNow, isValid, parse, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import {
  CheckInButton,
  CheckInDateSelector,
  CheckInDetail,
  SameDayCheckInNav,
} from "@/components/check-in";
import type { IComment, ICommentReply } from "@/components/check-in/reactions";
import { CommentSection, ReactionBar } from "@/components/check-in/reactions";
import type { IReactionCount } from "@/components/check-in/reactions";
import type { ICheckInDisplayData, ICheckInFormData } from "@/components/check-in/types";
import { PageHeader } from "@/components/layout";
import { mapApiMoodToMoodType, mapMoodTypeToApiMood } from "@/constants/mood";
import { PICKER_REACTIONS } from "@/constants/reaction-type";
import type { ReactionTypeType } from "@/constants/reaction-type";

// ============================================================================
// Comment helpers (mirrors pattern from practices/[id]/page.tsx)
// ============================================================================

interface IApiCommentUser {
  id?: string;
  name?: string;
  photoURL?: string | null;
  customId?: string | null;
}

interface IApiCommentNode {
  id: number | string;
  content?: string;
  createdAt?: string;
  user?: IApiCommentUser;
  userId?: number;
  replies?: unknown[];
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error !== "object" || error === null) return fallbackMessage;
  if ("details" in error && Array.isArray(error.details) && error.details.length > 0) {
    const first = error.details[0];
    if (typeof first === "object" && first !== null && "message" in first && typeof first.message === "string") {
      return first.message;
    }
  }
  if ("message" in error && typeof error.message === "string") return error.message;
  return fallbackMessage;
}

function isApiCommentNode(comment: unknown): comment is IApiCommentNode {
  return typeof comment === "object" && comment !== null && "id" in comment;
}

function formatCommentTime(createdAt?: string): string {
  if (!createdAt) return "剛剛";
  const d = parseISO(createdAt);
  if (!isValid(d)) return "剛剛";
  return formatDistanceToNow(d, { addSuffix: true, locale: zhTW });
}

function mapReply(reply: IApiCommentNode): ICommentReply {
  return {
    id: String(reply.id),
    author: {
      name: reply.user?.name || "匿名使用者",
      photoURL: reply.user?.photoURL || undefined,
      userId: reply.user?.id || undefined,
      numericUserId: reply.userId ?? undefined,
      customId: reply.user?.customId ?? undefined,
    },
    content: reply.content || "",
    time: formatCommentTime(reply.createdAt),
  };
}

function mapComment(comment: IApiCommentNode): IComment {
  const rawReplies = Array.isArray(comment.replies) ? comment.replies : [];
  return {
    id: String(comment.id),
    author: {
      name: comment.user?.name || "匿名使用者",
      photoURL: comment.user?.photoURL || undefined,
      userId: comment.user?.id || undefined,
      numericUserId: comment.userId ?? undefined,
      customId: comment.user?.customId ?? undefined,
    },
    content: comment.content || "",
    time: formatCommentTime(comment.createdAt),
    replies: rawReplies.filter(isApiCommentNode).map(mapReply),
  };
}

// ============================================================================

/**
 * 將 API 的 checkinDate 格式轉換為顯示格式
 * 從 "2024-01-20" 轉換為 "2024.01.20"
 */
const formatCheckInDate = (checkinDate: string): string => {
  const date = parse(checkinDate, "yyyy-MM-dd", new Date());
  if (!isValid(date)) {
    return checkinDate.replace(/-/g, ".");
  }
  return format(date, "yyyy.MM.dd");
};

/**
 * 日期打卡資訊
 */
interface IDateCheckInInfo {
  id: string;
  count: number;
}

/**
 * 生成完整的日期列表（從開始日期到結束日期）
 */
const generateFullDateRange = (
  startDate: string,
  durationDays: number,
  checkInsMap: Map<string, IDateCheckInInfo>
): Array<{ id: string; date: string; hasCheckIn: boolean; checkInCount: number }> => {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  if (!isValid(start)) {
    return [];
  }

  const dates: Array<{ id: string; date: string; hasCheckIn: boolean; checkInCount: number }> = [];

  for (let i = 0; i < durationDays; i++) {
    const currentDate = addDays(start, i);
    const dateString = format(currentDate, "yyyy-MM-dd");
    const checkInInfo = checkInsMap.get(dateString);

    dates.push({
      id: checkInInfo?.id || `empty-${dateString}`,
      date: dateString,
      hasCheckIn: !!checkInInfo,
      checkInCount: checkInInfo?.count || 0,
    });
  }

  return dates;
};

export default function CheckInDetailPage() {
  const params = useParams();
  const practiceId = params.id as string;
  const checkInId = params.checkInId as string;

  // 獲取 practice 資料
  const { data: practiceData, isLoading: isLoadingPractice } = usePracticeById(practiceId);

  const { data: currentUserData, isLoading: isLoadingCurrentUser } = useCurrentUser();

  // 更新打卡記錄
  const { updateCheckIn } = useUpdatePracticeCheckIn(practiceId, checkInId);

  // Reactions
  const { data: reactionsData, mutate: mutateReactions } = useReactions({
    targetType: "checkin",
    targetId: checkInId,
  });
  const [pendingReaction, setPendingReaction] = useState<ReactionTypeType | null | undefined>(
    undefined
  );
  const [, startReactionTransition] = useTransition();

  // Comments
  const { data: commentsData, mutate: mutateComments } = useComments({
    targetType: "checkin",
    targetId: checkInId,
  });
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // 獲取所有 check-ins
  const { data: checkInsData, isLoading: isLoadingCheckIns } = usePracticeCheckIns(practiceId, {
    limit: 30,
  });

  // 將 API 的 check-ins 轉換為 ICheckInDisplayData 格式
  const checkInsMap = useMemo(() => {
    const map = new Map<string, ICheckInDisplayData>();

    if (!checkInsData?.data || !practiceData?.data) {
      return map;
    }

    checkInsData.data.forEach((checkIn) => {
      const moodType = mapApiMoodToMoodType(checkIn.mood);

      const displayData: ICheckInDisplayData = {
        id: String(checkIn.id),
        date: formatCheckInDate(checkIn.checkinDate),
        mood: moodType,
        content: checkIn.note || "",
        tags: checkIn.tags || [],
        images: checkIn.imageUrls || [],
        practiceTitle: practiceData.data.title,
      };

      map.set(String(checkIn.id), displayData);
    });

    return map;
  }, [checkInsData, practiceData]);

  // 建立日期到 check-in 資訊的映射（用於生成日期列表，包含打卡次數）
  // 按 createdAt 排序後再建立，確保每日第一筆 ID 與同日切換導航的排序一致
  const checkInDateToIdMap = useMemo(() => {
    const map = new Map<string, IDateCheckInInfo>();

    if (!checkInsData?.data) {
      return map;
    }

    const sorted = [...checkInsData.data].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach((checkIn) => {
      const existing = map.get(checkIn.checkinDate);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(checkIn.checkinDate, {
          id: String(checkIn.id),
          count: 1,
        });
      }
    });

    return map;
  }, [checkInsData]);

  // 建立 check-in ID 到時間戳的映射（用於 lastCheckInDate 的 24 小時冷卻判斷）
  const checkInIdToDateMap = useMemo(() => {
    const map = new Map<string, string>();

    if (!checkInsData?.data) {
      return map;
    }

    checkInsData.data.forEach((checkIn) => {
      map.set(String(checkIn.id), checkIn.createdAt);
    });

    return map;
  }, [checkInsData]);

  // 計算同日打卡 ID 列表（用於同日多筆打卡切換）
  const { sameDayCheckInIds, currentIndexInDay, activeCheckInDate } = useMemo(() => {
    if (!checkInsData?.data) {
      return { sameDayCheckInIds: [], currentIndexInDay: 0, activeCheckInDate: "" };
    }

    // 找到目前打卡的日期
    const currentCheckIn = checkInsData.data.find((c) => String(c.id) === checkInId);
    if (!currentCheckIn) {
      return { sameDayCheckInIds: [], currentIndexInDay: 0, activeCheckInDate: "" };
    }

    const currentDate = currentCheckIn.checkinDate;

    // 篩選同日所有打卡，按 createdAt 排序（舊→新）
    const sameDayItems = checkInsData.data
      .filter((c) => c.checkinDate === currentDate)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const ids = sameDayItems.map((c) => String(c.id));
    const index = ids.indexOf(checkInId);

    return {
      sameDayCheckInIds: ids,
      currentIndexInDay: index >= 0 ? index : 0,
      activeCheckInDate: currentDate,
    };
  }, [checkInsData, checkInId]);

  // 獲取目標 check-in 資料
  const checkInData = useMemo(() => {
    return checkInsMap.get(checkInId) || null;
  }, [checkInsMap, checkInId]);

  // 生成完整的日期列表（包含空缺的日期）
  const fullCheckInDates = useMemo(() => {
    if (!practiceData?.data) {
      return [];
    }

    return generateFullDateRange(
      practiceData.data.startDate || "",
      practiceData.data.durationDays || 0,
      checkInDateToIdMap
    );
  }, [practiceData, checkInDateToIdMap]);

  // 將 check-ins 轉換為 Record 格式供 CheckInDateSelector 使用
  const checkInsRecord = useMemo(() => {
    const record: Record<string, ICheckInDisplayData> = {};
    checkInsMap.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }, [checkInsMap]);

  // Derived reaction state (must be before early returns — hooks below depend on these values)
  const currentUserReaction = (reactionsData?.data?.currentUserReaction ?? null) as ReactionTypeType | null;
  const effectiveReaction = pendingReaction !== undefined ? pendingReaction : currentUserReaction;
  const selectedReactions: ReactionTypeType[] = effectiveReaction ? [effectiveReaction] : [];
  const reactionCounts: IReactionCount[] = (reactionsData?.data?.reactions ?? []).map((r) => ({
    type: r.type as ReactionTypeType,
    count: r.count,
    latestActorName: r.latestActorName ?? undefined,
  }));

  const handleReactionClick = useCallback(
    (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      setPendingReaction(isSelected ? null : type);
      startReactionTransition(async () => {
        if (isSelected) {
          await removeReaction({ targetType: "checkin", targetId: checkInId });
        } else {
          await upsertReaction({
            targetType: "checkin",
            targetId: checkInId,
            reactionType: type as ReactionTypeValue,
          });
        }
        await mutateReactions();
        setPendingReaction(undefined);
      });
    },
    [currentUserReaction, checkInId, mutateReactions]
  );

  // Derived comment state
  const comments = useMemo(() => {
    const raw = commentsData?.data;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isApiCommentNode).map(mapComment);
  }, [commentsData]);

  const handleCommentSubmit = useCallback(
    async (content: string, _reactions: ReactionTypeType[], parentId?: string, mentionedUserIds?: number[]) => {
      const response = await createComment({
        targetType: "checkin",
        targetId: checkInId,
        content,
        visibility: "public",
        parentId: parentId ? Number(parentId) : undefined,
        mentionedUserIds: mentionedUserIds?.length ? mentionedUserIds : undefined,
      });
      if (response.error) {
        toast.error(getErrorMessage(response.error, "留言失敗"));
        return;
      }
      toast.success("留言成功！");
      await mutateComments();
    },
    [checkInId, mutateComments]
  );

  const handleCommentEdit = useCallback(
    async (commentId: string, content: string) => {
      const id = Number(commentId);
      if (!Number.isFinite(id)) { toast.error("留言 ID 無效"); return false; }
      const response = await updateComment(id, { content });
      if (response.error) { toast.error(getErrorMessage(response.error, "更新留言失敗")); return false; }
      await mutateComments();
      return true;
    },
    [mutateComments]
  );

  const handleCommentDelete = useCallback(
    async (commentId: string) => {
      const id = Number(commentId);
      if (!Number.isFinite(id)) { toast.error("留言 ID 無效"); return false; }
      const response = await deleteComment(id);
      if (response.error) { toast.error(getErrorMessage(response.error, "刪除留言失敗")); return false; }
      await mutateComments();
      return true;
    },
    [mutateComments]
  );

  // Loading 狀態
  if (isLoadingPractice || isLoadingCheckIns || isLoadingCurrentUser) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
        <Deco4Svg className="absolute top-0 right-0 -z-10" width={270} height={484} />
        <PageHeader
          title="打卡紀錄"
          rightActionTo={`/practices/${practiceId}`}
          variant="light"
          disableLightOn="mobile"
        />
        <main className="max-w-[448px] mx-auto pt-[88px] md:pt-[72px] px-5 pb-40">
          <div className="text-center text-white">載入中...</div>
        </main>
      </div>
    );
  }

  // Error 或找不到 check-in 的狀態
  if (!checkInData || !practiceData?.data) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
        <Deco4Svg className="absolute top-0 right-0 -z-10" width={270} height={484} />
        <PageHeader
          title="打卡紀錄"
          rightActionTo={`/practices/${practiceId}`}
          variant="light"
          disableLightOn="mobile"
        />
        <main className="max-w-[448px] mx-auto pt-[88px] md:pt-[72px] px-5 pb-40">
          <div className="text-center text-white">找不到打卡記錄</div>
        </main>
      </div>
    );
  }

  // 判斷當前用戶是否為實踐的擁有者
  const isOwner =
    !!practiceData?.data?.user?.id && practiceData.data.user.id === currentUserData?.data?.id;

  const handleCheckInComplete = (data: unknown) => {
    // TODO: 處理打卡資料
    console.log("打卡資料:", data);
  };

  const handleEditComplete = async (data: ICheckInFormData) => {
    try {
      const apiMood = mapMoodTypeToApiMood(data.mood);
      await updateCheckIn({
        mood: apiMood,
        tags: data.tags,
        description: data.description,
        media: data.media,
        existingImageUrls: data.existingImageUrls,
      });
      toast.success("打卡已更新");
    } catch (error) {
      console.error("更新打卡失敗:", error);
      toast.error("更新打卡失敗，請稍後再試");
      throw error;
    }
  };

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
      <Deco4Svg className="absolute top-0 right-0 -z-10" width={270} height={484} />

      {/* 日期選擇器（mobile 版本整合標題列） */}
      <CheckInDateSelector
        checkInDates={fullCheckInDates}
        checkIns={checkInsRecord}
        activeCheckInId={checkInId}
        activeDate={activeCheckInDate}
        practiceId={practiceId}
        title="打卡紀錄"
        closeActionTo={`/practices/${practiceId}`}
      />

      {/* Desktop 版本的標題列 */}
      <div className="hidden md:block">
        <PageHeader title="打卡紀錄" rightActionTo={`/practices/${practiceId}`} variant="light" />
      </div>

      <main className="max-w-[448px] mx-auto pt-[150px] md:pt-10 px-5 pb-52">
        <CheckInDetail
          checkInData={checkInData}
          onEditComplete={isOwner ? handleEditComplete : undefined}
          afterTitle={
            <SameDayCheckInNav
              sameDayCheckInIds={sameDayCheckInIds}
              currentIndex={currentIndexInDay}
              practiceId={practiceId}
            />
          }
          bottomActions={
            <ReactionBar
              reactions={reactionCounts}
              selectedReactions={selectedReactions}
              onReactionClick={handleReactionClick}
              types={PICKER_REACTIONS}
              className="flex-wrap"
            />
          }
        />

        {/* 留言區 */}
        <div className="mt-4 bg-white rounded-2xl overflow-hidden">
          <CommentSection
            comments={comments}
            selectedReactions={selectedReactions}
            inputRef={commentInputRef}
            onSubmit={handleCommentSubmit}
            hasMoreComments={comments.length > 2}
            currentUserName={currentUserData?.data?.name ?? undefined}
            currentUserId={currentUserData?.data?.id ?? undefined}
            currentUserPhotoURL={
              typeof currentUserData?.data?.photoURL === "string"
                ? currentUserData.data.photoURL
                : undefined
            }
            onEditComment={handleCommentEdit}
            onDeleteComment={handleCommentDelete}
          />
        </div>
      </main>

      {isOwner && (
        <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray z-20">
          {/* 打卡按鈕 */}
          <CheckInButton
            variant="orange"
            className="w-full sm:max-w-[288px]"
            practiceId={practiceId}
            practiceStatus={practiceData?.data?.status}
            lastCheckInDate={checkInIdToDateMap.get(checkInId) || null}
            startDate={practiceData?.data?.startDate || null}
            endDate={practiceData?.data?.endDate || null}
            taskTitle={checkInData.practiceTitle}
            onComplete={handleCheckInComplete}
            progressPercentage={practiceData?.data?.progressPercentage ?? 0}
          />
        </footer>
      )}
    </div>
  );
}
