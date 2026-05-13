"use client";

import type { ReactionTypeValue } from "@daodao/api";
import {
  createComment,
  deleteComment,
  removeReaction,
  updateComment,
  upsertReaction,
  useComments,
  useCurrentUser,
  useReactions,
  useReactionsList,
} from "@daodao/api";
import { ChartColumnIncreasingSvg, DialogOutlineSvg, FlagOutlineSvg } from "@daodao/assets";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { ImageLightbox } from "@daodao/ui/components/image-lightbox";
import { toast } from "@daodao/ui/components/sonner";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Ellipsis, Pencil, Share2 } from "lucide-react";
import * as React from "react";
import { useCallback, useTransition } from "react";
import {
  CommentSection,
  type IComment,
  type ICommentReply,
  ReactionPickerButton,
} from "@/components/check-in/reactions";
import {
  BrowseActivityContent,
  type IBrowseActivityFollower,
} from "@/components/practice/shared/browse-activity-content";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { useEditCheckInSheet } from "@/hooks/use-edit-check-in-sheet";
import { useShareCheckInSheet } from "@/hooks/use-share-check-in-sheet";
import { formatRelativeTime } from "@/utils/format-time";
import type { ICheckInDisplayData, ICheckInFormData } from "../types";
import { CheckInCard } from "./check-in-card";

export type { ICheckInDisplayData as CheckInData };

interface ICheckInDetailProps {
  checkInData: ICheckInDisplayData;
  /** 編輯完成回調 */
  onEditComplete?: (data: ICheckInFormData) => Promise<void> | void;
  /** 標題下方額外內容（如同日打卡切換導航） */
  afterTitle?: React.ReactNode;
  /**
   * 是否為本人的打卡（控制選單內容）
   * true（預設）→ 顯示「編輯打卡」+「瀏覽活動」
   * false → 顯示「檢舉」+「瀏覽活動」
   */
  isOwner?: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

export function formatCommentTime(createdAt?: string): string {
  if (!createdAt) return "剛剛";
  const parsed = parseISO(createdAt);
  if (!isValid(parsed)) return "剛剛";
  return formatDistanceToNow(parsed, { addSuffix: true, locale: zhTW });
}

export type ApiCommentNode = {
  id: number | string;
  userId?: number | null;
  content?: string | null;
  createdAt?: string;
  replies?: unknown[];
  user?: {
    id?: string | null;
    name?: string | null;
    photoURL?: string | null;
    customId?: string | null;
  } | null;
};

export function isApiCommentNode(v: unknown): v is ApiCommentNode {
  return typeof v === "object" && v !== null && "id" in v;
}

export function mapReply(reply: ApiCommentNode): ICommentReply {
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

export function mapComment(comment: ApiCommentNode): IComment {
  const rawReplies = Array.isArray(comment.replies) ? comment.replies : [];
  const mappedReplies = rawReplies.filter(isApiCommentNode).map(mapReply);
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
    replies: mappedReplies,
  };
}

// ============================================================================
// CheckInCommentSheetContent — owns its own SWR state so it stays live in Sheet
// ============================================================================

export interface ICheckInCommentSheetContentProps {
  readonly checkInId: string;
  readonly currentUserName?: string;
  readonly currentUserId?: string;
  readonly currentUserPhotoURL?: string;
}

export function CheckInCommentSheetContent({
  checkInId,
  currentUserName,
  currentUserId,
  currentUserPhotoURL,
}: ICheckInCommentSheetContentProps) {
  const { data: commentsData, mutate: mutateComments } = useComments({
    targetType: "checkin",
    targetId: checkInId,
  });

  const comments: IComment[] = React.useMemo(() => {
    const raw = commentsData?.data;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isApiCommentNode).map(mapComment);
  }, [commentsData]);

  const handleSubmitComment = useCallback(
    async (
      text: string,
      _reactions: ReactionTypeType[],
      parentId?: string,
      mentionedUserIds?: number[]
    ) => {
      const response = await createComment({
        targetType: "checkin",
        targetId: checkInId,
        content: text,
        visibility: "public",
        parentId: parentId ? Number(parentId) : undefined,
        mentionedUserIds: mentionedUserIds?.length ? mentionedUserIds : undefined,
      });
      if (response.error) {
        toast.error("留言失敗，請稍後再試");
        return;
      }
      toast.success("留言成功！");
      await mutateComments();
    },
    [checkInId, mutateComments]
  );

  const handleEditComment = useCallback(
    async (commentId: string, text: string) => {
      const id = Number(commentId);
      if (!Number.isFinite(id)) {
        toast.error("留言 ID 無效");
        return false;
      }
      const response = await updateComment(id, { content: text });
      if (response.error) {
        toast.error("更新留言失敗");
        return false;
      }
      await mutateComments();
      return true;
    },
    [mutateComments]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      const id = Number(commentId);
      if (!Number.isFinite(id)) {
        toast.error("留言 ID 無效");
        return false;
      }
      const response = await deleteComment(id);
      if (response.error) {
        toast.error("刪除留言失敗");
        return false;
      }
      await mutateComments();
      return true;
    },
    [mutateComments]
  );

  return (
    <CommentSection
      comments={comments}
      selectedReactions={[]}
      onSubmit={handleSubmitComment}
      hasMoreComments={comments.length > 2}
      currentUserName={currentUserName}
      currentUserId={currentUserId}
      currentUserPhotoURL={currentUserPhotoURL}
      onEditComment={handleEditComment}
      onDeleteComment={handleDeleteComment}
    />
  );
}

// ============================================================================
// CheckInDetail
// ============================================================================

export const CheckInDetail = ({
  checkInData,
  onEditComplete,
  afterTitle,
  isOwner = true,
}: ICheckInDetailProps) => {
  const { date, mood, content, tags, images, practiceTitle } = checkInData;
  const checkInId = checkInData.id;

  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const { open: openSheet } = useSheetManager();

  // ── Reactions ──────────────────────────────────────────────────────────────
  const { data: reactionsData, mutate: mutateReactions } = useReactions({
    targetType: "checkin",
    targetId: checkInId,
  });
  const [, startReactionTransition] = useTransition();
  const [pendingReaction, setPendingReaction] = React.useState<ReactionTypeType | null | undefined>(
    undefined
  );

  const currentUserReaction = (reactionsData?.data?.currentUserReaction ??
    null) as ReactionTypeType | null;
  const effectiveReaction = pendingReaction !== undefined ? pendingReaction : currentUserReaction;
  const selectedReactions: ReactionTypeType[] = effectiveReaction ? [effectiveReaction] : [];
  const totalReactionCount = (reactionsData?.data?.reactions ?? []).reduce(
    (sum, r) => sum + r.count,
    0
  );

  const handleReactionToggle = useCallback(
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

  // ── Reactions List（用於瀏覽活動）──────────────────────────────────────────
  const { data: reactionsListData } = useReactionsList({
    targetType: "checkin",
    targetId: checkInId,
  });

  // ── Comments ───────────────────────────────────────────────────────────────
  const { data: commentsData } = useComments({
    targetType: "checkin",
    targetId: checkInId,
  });
  const { data: currentUserData } = useCurrentUser();

  const commentCount = React.useMemo(() => {
    const raw = commentsData?.data;
    return Array.isArray(raw) ? raw.filter(isApiCommentNode).length : 0;
  }, [commentsData]);

  const currentUser = currentUserData?.data;
  const currentUserId = currentUser?.id ?? undefined;
  const currentUserName = currentUser?.name ?? undefined;
  const currentUserPhotoURL =
    (currentUser as { photoURL?: string; photoUrl?: string } | undefined)?.photoURL ??
    (currentUser as { photoURL?: string; photoUrl?: string } | undefined)?.photoUrl ??
    undefined;

  // ── Browse Activity ────────────────────────────────────────────────────────
  const handleOpenBrowseActivity = useCallback(() => {
    const reactionItems = reactionsListData?.data?.items ?? [];
    const followers: IBrowseActivityFollower[] = reactionItems.map((item) => ({
      id: String(item.userId),
      name: item.name,
      photoURL: item.photoURL ?? undefined,
      time: formatRelativeTime(item.reactedAt),
      reaction: item.reactionType as ReactionTypeType,
    }));
    openSheet({
      title: "瀏覽活動",
      content: (
        <BrowseActivityContent
          viewCount={0}
          commentCount={commentCount}
          followers={followers}
          onClose={() => {}}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  }, [reactionsListData, commentCount, openSheet]);

  // ── Edit / Share ───────────────────────────────────────────────────────────
  const { openEditCheckInSheet } = useEditCheckInSheet({
    taskTitle: practiceTitle,
    checkInData: { mood, tags, description: content, images },
    onComplete: async (data) => {
      await onEditComplete?.(data);
    },
  });

  const { openShareSheet } = useShareCheckInSheet({
    taskTitle: practiceTitle,
    checkInData: {
      mood,
      tags,
      description: content,
      media: [],
      date,
      images,
    } as ICheckInFormData & { date: string; images?: string[] },
  });

  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  // ── Bottom action bar (injected into card) ─────────────────────────────────
  const bottomActions = (
    <div className="flex items-center border-t border-[#E4EAE9] py-4 px-4">
      {/* Reaction button */}
      <div className="flex-1 flex justify-center rounded-xl hover:bg-gray-100 transition-colors py-1">
        <ReactionPickerButton
          selectedReactions={selectedReactions}
          onToggle={handleReactionToggle}
          variant="card"
          totalCount={totalReactionCount > 0 ? totalReactionCount : undefined}
        />
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[#E4EAE9]" />

      {/* Comment button */}
      <div className="flex-1 flex justify-center rounded-xl hover:bg-gray-100 transition-colors py-1">
        <button
          type="button"
          onClick={() =>
            openSheet({
              title: "留言",
              content: (
                <CheckInCommentSheetContent
                  checkInId={checkInId}
                  currentUserName={currentUserName}
                  currentUserId={currentUserId}
                  currentUserPhotoURL={currentUserPhotoURL}
                />
              ),
              dismissible: true,
              closeOnEscape: true,
              showCloseButton: true,
            })
          }
          className="flex items-center gap-1.5 p-1.5 text-text-dark cursor-pointer"
        >
          <DialogOutlineSvg className="size-[22px]" />
          {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-[350px] mx-auto">
      {/* 三點選單 */}
      <div className="flex justify-end mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full bg-primary-darker/60 text-white hover:bg-primary-darker/80 hover:text-white"
            >
              <Ellipsis className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner ? (
              <>
                {onEditComplete && (
                  <DropdownMenuItem onClick={openEditCheckInSheet} className="gap-2 text-text-dark">
                    <Pencil className="size-4 shrink-0" />
                    編輯打卡
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleOpenBrowseActivity}
                  className="gap-2 text-text-dark"
                >
                  <ChartColumnIncreasingSvg className="size-4 shrink-0" />
                  瀏覽活動
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => window.open("https://tally.so/r/BzGQy4", "_blank")}
                  className="gap-2 text-text-dark"
                >
                  <FlagOutlineSvg className="size-4 shrink-0" />
                  檢舉
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleOpenBrowseActivity}
                  className="gap-2 text-text-dark"
                >
                  <ChartColumnIncreasingSvg className="size-4 shrink-0" />
                  瀏覽活動
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CheckInCard
        taskTitle={practiceTitle}
        date={date}
        mood={mood}
        content={content}
        tags={tags}
        images={images}
        onImageClick={handleImageClick}
        showTape={true}
        afterTitle={afterTitle}
        bottomActions={bottomActions}
      />

      <div className="flex flex-col w-fit gap-4 mx-auto">
        {/* 分享按鈕 */}
        <Button variant="white" className="px-8" onClick={openShareSheet}>
          <Share2 className="size-4 mr-2" />
          分享這篇打卡
        </Button>
      </div>

      {/* 圖片 Lightbox */}
      {images && images.length > 0 && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </div>
  );
};
