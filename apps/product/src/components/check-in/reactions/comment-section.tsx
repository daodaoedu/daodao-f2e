"use client";

import type { ReactionTypeValue } from "@daodao/api";
import { removeReaction, upsertReaction, useReactions } from "@daodao/api";
import { DialogOutlineSvg } from "@daodao/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { cn } from "@daodao/ui/lib/utils";
import { MentionInput, useMentionInput } from "@daodao/features-mention";
import type { MentionCandidate } from "@daodao/features-mention";
import { MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  PICKER_REACTIONS,
  REACTION_CONFIG,
  type ReactionTypeType,
} from "@/constants/reaction-type";
import { ReactionPickerButton } from "./reaction-picker-button";

const PREVIEW_COUNT = 2;

// ============================================================================
// Types
// ============================================================================

export interface ICommentAuthor {
  name: string;
  photoURL?: string;
  userId?: string;
  numericUserId?: number;
  customId?: string | null;
}

export interface ICommentReply {
  id: string;
  author: ICommentAuthor;
  content: string;
  reactions?: ReactionTypeType[];
  time: string;
}

export interface IComment {
  id: string;
  author: ICommentAuthor;
  content: string;
  reactions?: ReactionTypeType[];
  time: string;
  replies?: ICommentReply[];
}

// ============================================================================
// Avatar color
// ============================================================================

const AVATAR_COLORS = [
  "bg-[#FFD6C8]",
  "bg-[#C8FFE4]",
  "bg-[#C8DCFF]",
  "bg-[#FFC8F0]",
  "bg-[#FEFFC8]",
  "bg-[#C8FFF2]",
  "bg-[#E4C8FF]",
  "bg-[#FFE4C8]",
  "bg-[#C8F0FF]",
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? "bg-[#C8FFF2]";
}

// ============================================================================
// @mention helpers
// ============================================================================

/** Renders comment content with @mention tokens highlighted */
function renderContent(content: string) {
  const parts = content.split(/(@\S+)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split segments
          <span key={i} className="text-logo-cyan font-medium">
            {part}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split segments
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ============================================================================
// CommentBubble (single comment or reply)
// ============================================================================

interface CommentBubbleProps {
  comment: IComment | ICommentReply;
  isReply?: boolean;
  onReply?: () => void;
  isOwn?: boolean;
  onEdit?: (id: string, content: string) => Promise<unknown> | unknown;
  onDelete?: (id: string) => Promise<unknown> | unknown;
  participants: MentionCandidate[];
}

function CommentBubble({
  comment,
  isReply = false,
  onReply,
  isOwn = false,
  onEdit,
  onDelete,
  participants,
}: CommentBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: reactionsData, mutate: mutateReactions } = useReactions({
    targetType: "comment",
    targetId: comment.id,
  });
  const [, startReactionTransition] = useTransition();
  const [pendingReaction, setPendingReaction] = useState<ReactionTypeType | null | undefined>(
    undefined
  );

  const currentUserReaction = (reactionsData?.data?.currentUserReaction ??
    null) as ReactionTypeType | null;
  const effectiveReaction = pendingReaction !== undefined ? pendingReaction : currentUserReaction;
  const commentReactions: ReactionTypeType[] = effectiveReaction ? [effectiveReaction] : [];
  const totalReactionCount = (reactionsData?.data?.reactions ?? []).reduce(
    (sum, r) => sum + r.count,
    0
  );
  const activeReactionTypes = (reactionsData?.data?.reactions ?? [])
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((r) => r.type as ReactionTypeType);
  const displayReactions = effectiveReaction
    ? [effectiveReaction, ...activeReactionTypes.filter((t) => t !== effectiveReaction)].slice(
        0,
        PICKER_REACTIONS.length
      )
    : activeReactionTypes.slice(0, PICKER_REACTIONS.length);

  const handleCommentReactionToggle = useCallback(
    (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      setPendingReaction(isSelected ? null : type);
      startReactionTransition(async () => {
        if (isSelected) {
          await removeReaction({ targetType: "comment", targetId: comment.id });
        } else {
          await upsertReaction({
            targetType: "comment",
            targetId: comment.id,
            reactionType: type as ReactionTypeValue,
          });
        }
        await mutateReactions();
        setPendingReaction(undefined);
      });
    },
    [currentUserReaction, comment.id, mutateReactions]
  );
  const { openWarningDialog } = useDialog();

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSaveEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const result = await onEdit?.(comment.id, trimmed);
    if (result === false) return; // page-level handler already shows the error toast
    toast.success("已更新留言");
    setEditing(false);
  };

  const avatarSizeClass = isReply ? "size-8" : "size-10";
  const authorTextClass = "text-sm";
  const timeTextClass = isReply ? "text-[11px]" : "text-xs";

  return (
    <div className={cn("flex gap-[11px] items-start", isReply && "py-1")}>
      {/* Avatar */}
      <div className="shrink-0">
        <Avatar className={avatarSizeClass}>
          {comment.author.photoURL && (
            <AvatarImage src={comment.author.photoURL} alt={comment.author.name} />
          )}
          <AvatarFallback
            className={cn(
              "text-sm font-medium text-text-dark",
              getAvatarColor(comment.author.name)
            )}
          >
            {comment.author.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        {/* Author + time + own-comment menu */}
        <div className="flex items-center gap-2 mb-0.5">
          {comment.author.userId ? (
            <CustomLink
              href={`/users/${comment.author.userId}`}
              className={cn("font-semibold text-[#295E5C] hover:underline", authorTextClass)}
            >
              {comment.author.name}
            </CustomLink>
          ) : (
            <span className={cn("font-semibold text-[#295E5C]", authorTextClass)}>
              {comment.author.name}
            </span>
          )}
          <span className={cn("text-[#295E5C]/50", timeTextClass)}>{comment.time}</span>
          {isOwn && !editing && (
            <div ref={menuRef} className="relative ml-auto">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen((v) => !v)}
                className={cn(
                  "h-6 w-6 p-0.5 rounded transition-colors",
                  menuOpen ? "text-text-dark bg-[#E4EAE9]" : "text-[#9FB5B8] hover:text-text-dark"
                )}
              >
                <MoreHorizontal className="size-4" />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#E4EAE9] py-1 z-20 min-w-[100px]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setMenuOpen(false);
                      setEditing(true);
                    }}
                    className="w-full h-auto justify-start gap-2 px-3 py-2 text-xs text-[#295E5C] hover:bg-[#F0F9F8] transition-colors"
                  >
                    <Pencil className="size-3.5" />
                    <span>修改</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      setMenuOpen(false);
                      const result = await openWarningDialog({
                        title: "確定刪除這則留言？",
                        message: "一旦刪除就無法復原。",
                        textAlign: "left",
                        buttons: [
                          { label: "確定刪除", value: "confirm", variant: "outline" },
                          { label: "先不要", value: "cancel", variant: "orange" },
                        ],
                      });
                      if (result.value === "confirm") {
                        const deleteResult = await onDelete?.(comment.id);
                        if (deleteResult !== false) {
                          toast.success("已刪除留言");
                        }
                      }
                    }}
                    className="w-full h-auto justify-start gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                    <span>刪除</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content or edit mode */}
        {editing ? (
          <div className="flex flex-col gap-2">
            <MentionInput
              value={editValue}
              onChange={setEditValue}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void handleSaveEdit();
                }
              }}
              rows={3}
              autoFocus
              participants={participants}
              className="w-full resize-none rounded-lg border border-logo-cyan bg-white px-3 py-2 text-sm text-[#295E5C] focus:outline-none"
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setEditValue(comment.content);
                }}
                className="text-xs px-3 py-1 rounded-full border-[#E4EAE9] text-[#9FB5B8] hover:bg-[#F0F9F8] transition-colors"
              >
                取消
              </Button>
              <Button
                type="button"
                onClick={() => {
                  void handleSaveEdit();
                }}
                className="text-xs px-3 py-1 rounded-full bg-logo-cyan text-white hover:bg-logo-cyan/80 transition-colors"
              >
                儲存
              </Button>
            </div>
          </div>
        ) : (
          <p className={cn("text-[#295E5C] leading-5 whitespace-pre-wrap", "text-sm")}>
            {renderContent(comment.content)}
          </p>
        )}

        {/* Actions: reaction + reply (hidden while editing) */}
        {!editing && (
          <div className="flex items-center gap-3 mt-1.5">
            <ReactionPickerButton
              selectedReactions={commentReactions}
              onToggle={handleCommentReactionToggle}
              variant="comment"
              totalCount={totalReactionCount > 0 ? totalReactionCount : undefined}
              displayReactions={displayReactions.length > 0 ? displayReactions : undefined}
            />
            {!isReply && onReply && (
              <Button
                type="button"
                variant="ghost"
                onClick={onReply}
                className={cn(
                  "h-auto px-0 flex items-center gap-1 text-xs transition-colors",
                  "text-[#9FB5B8] hover:text-logo-cyan"
                )}
              >
                <DialogOutlineSvg className="size-5" />
                {"replies" in comment && comment.replies && comment.replies.length > 0 && (
                  <span>{comment.replies.length}</span>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CommentSection
// ============================================================================

interface CommentSectionProps {
  comments: IComment[];
  selectedReactions: ReactionTypeType[];
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: (
    content: string,
    reactions: ReactionTypeType[],
    parentId?: string,
    mentionedUserIds?: number[]
  ) => void;
  /** 是否顯示「更多留言」摺疊按鈕 */
  hasMoreComments?: boolean;
  /** 當前登入用戶的名稱（顯示用） */
  currentUserName?: string;
  /** 當前登入用戶的 ID，用於判斷是否為自己的留言 */
  currentUserId?: string;
  /** 當前登入用戶的頭像 URL */
  currentUserPhotoURL?: string;
  onEditComment?: (id: string, content: string) => Promise<unknown> | unknown;
  onDeleteComment?: (id: string) => Promise<unknown> | unknown;
}

export function CommentSection({
  comments,
  selectedReactions,
  inputRef: externalRef,
  onSubmit,
  hasMoreComments = false,
  currentUserName,
  currentUserId,
  currentUserPhotoURL,
  onEditComment,
  onDeleteComment,
}: CommentSectionProps) {
  const [inputValue, setInputValue] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const { handleMentionSelect, getActiveMentionIds, reset: resetMentions } = useMentionInput();
  const [replyMentionedIds, setReplyMentionedIds] = useState<Record<string, Map<number, string>>>(
    {}
  );
  const [expanded, setExpanded] = useState(false);
  const previewComments = hasMoreComments ? comments.slice(0, PREVIEW_COUNT) : comments;
  const hiddenComments = hasMoreComments ? comments.slice(PREVIEW_COUNT) : [];
  const hiddenCount = hiddenComments.length;
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef ?? internalRef;

  // Derive participants list from all comment authors for @mention dropdown
  const participants = useMemo<MentionCandidate[]>(() => {
    const seen = new Set<string>();
    const result: MentionCandidate[] = [];
    for (const comment of comments) {
      if (comment.author.userId && !seen.has(comment.author.userId)) {
        seen.add(comment.author.userId);
        result.push({
          userId: comment.author.userId,
          numericUserId: comment.author.numericUserId,
          name: comment.author.name,
          photoURL: comment.author.photoURL,
          customId: comment.author.customId,
        });
      }
      for (const reply of comment.replies ?? []) {
        if (reply.author.userId && !seen.has(reply.author.userId)) {
          seen.add(reply.author.userId);
          result.push({
            userId: reply.author.userId,
            numericUserId: reply.author.numericUserId,
            name: reply.author.name,
            photoURL: reply.author.photoURL,
            customId: reply.author.customId,
          });
        }
      }
    }
    return result.filter((p) => p.numericUserId !== undefined);
  }, [comments]);

  // Track the previous set to detect newly added reactions
  const prevSelectedRef = useRef<ReactionTypeType[]>([]);

  // When reactions are added: append their placeholder text and scroll to input
  // biome-ignore lint/correctness/useExhaustiveDependencies: ref.current is intentionally excluded — it's stable and doesn't trigger re-renders
  useEffect(() => {
    const prev = prevSelectedRef.current;
    const newlyAdded = selectedReactions.filter((r) => !prev.includes(r));

    if (newlyAdded.length > 0) {
      setInputValue((current) => {
        const additions = newlyAdded.map((r) => REACTION_CONFIG[r].placeholder).join(" ");
        return current.trim() ? `${current.trim()} ${additions}` : additions;
      });
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      });
    }

    prevSelectedRef.current = selectedReactions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReactions]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    onSubmit(trimmed, selectedReactions, undefined, getActiveMentionIds(trimmed));
    setInputValue("");
    resetMentions();
    setReplyTo(null);
  };

  const handleSetReplyTo = (id: string | null) => {
    // Clear any draft text for the reply box being closed
    if (replyTo && replyTo !== id) {
      setReplyInputs((prev) => ({ ...prev, [replyTo]: "" }));
    }
    setReplyTo(id);
  };

  const handleReplySubmit = (parentId: string) => {
    const replyValue = replyInputs[parentId] ?? "";
    const trimmed = replyValue.trim();
    if (!trimmed) return;

    const replyMentions = replyMentionedIds[parentId] ?? new Map<number, string>();
    const activeMentionIds = [...replyMentions.entries()]
      .filter(([, handle]) => trimmed.includes(`@${handle}`))
      .map(([id]) => id);

    onSubmit(trimmed, selectedReactions, parentId, activeMentionIds);
    setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
    setReplyMentionedIds((prev) => {
      const next = { ...prev };
      delete next[parentId];
      return next;
    });
    setReplyTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderCommentBlock = (comment: IComment) => (
    <div key={comment.id}>
      <CommentBubble
        comment={comment}
        onReply={() => handleSetReplyTo(comment.id)}
        isOwn={!!currentUserId && comment.author.userId === currentUserId}
        onEdit={onEditComment}
        onDelete={onDeleteComment}
        participants={participants}
      />
      {/* Replies */}
      {comment.replies?.map((reply) => (
        <div
          key={reply.id}
          className="mt-3 ml-6 pl-4 border-l border-[#E4EAE9] bg-[#F7FBFB] rounded-lg"
        >
          <CommentBubble
            comment={reply}
            isReply
            isOwn={!!currentUserId && reply.author.userId === currentUserId}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
            participants={participants}
          />
        </div>
      ))}
      {/* Inline reply input */}
      {replyTo === comment.id && (
        <div className="pl-[40px] flex gap-2 items-center mt-3">
          <MentionInput
            value={replyInputs[comment.id] ?? ""}
            onChange={(v) => setReplyInputs((prev) => ({ ...prev, [comment.id]: v }))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleReplySubmit(comment.id);
              }
            }}
            placeholder={`${comment.author.name}...`}
            rows={1}
            participants={participants}
            className="flex-1 resize-none rounded-lg border border-[#E4EAE9] bg-white px-4 py-2 text-sm text-[#295E5C] placeholder:text-[#9FB5B8] focus:outline-none focus:border-logo-cyan transition-colors min-h-[40px] w-full"
            onMentionSelect={(candidate) => {
              if (!candidate.numericUserId) return;
              const pid = String(comment.id);
              setReplyMentionedIds((prev) => {
                const prevMap = prev[pid] ?? new Map<number, string>();
                const next = new Map(prevMap);
                next.set(candidate.numericUserId as number, candidate.customId || candidate.name);
                return { ...prev, [pid]: next };
              });
            }}
          />
          <Button
            size="icon"
            className="shrink-0 size-9 rounded-full bg-logo-cyan hover:bg-logo-cyan/80"
            onClick={() => handleReplySubmit(comment.id)}
          >
            <Send className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* 主留言輸入框（置頂） */}
      <div className="relative z-10 bg-white border-b border-[#E4EAE9] flex gap-2 items-center px-4 py-3">
        {/* User avatar */}
        <Avatar className="size-9 shrink-0">
          {currentUserPhotoURL && (
            <AvatarImage src={currentUserPhotoURL} alt={currentUserName || "我"} />
          )}
          <AvatarFallback className={cn(getAvatarColor("Me"))} />
        </Avatar>

        {/* Input with @mention support */}
        <MentionInput
          value={inputValue}
          onChange={setInputValue}
          onKeyDown={handleKeyDown}
          placeholder={selectedReactions.length === 0 ? "寫下你的留言..." : ""}
          rows={1}
          inputRef={ref}
          participants={participants}
          className="flex-1 resize-none rounded-lg border border-[#E4EAE9] bg-white px-4 py-2 text-sm text-[#295E5C] placeholder:text-[#9FB5B8] focus:outline-none focus:border-logo-cyan transition-colors h-10 w-full"
          onMentionSelect={handleMentionSelect}
        />

        {/* Send */}
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className="shrink-0 size-10 rounded-full bg-logo-cyan hover:bg-logo-cyan/80 disabled:opacity-40"
        >
          <Send className="size-4" />
        </Button>
      </div>

      {/* 留言列表 */}
      {comments.length > 0 ? (
        <div className="flex flex-col gap-5 px-4 pt-4 pb-2">
          {previewComments.map(renderCommentBlock)}
        </div>
      ) : (
        <div className="flex items-center justify-center px-4 py-8 text-sm text-[#9FB5B8]">
          尚未有留言
        </div>
      )}

      {/* 更多留言（帶動畫展開） */}
      {hasMoreComments && hiddenCount > 0 && (
        <>
          {/* 展開按鈕 */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setExpanded((v) => !v)}
            className="w-full h-auto py-3 text-sm text-[#9FB5B8] flex items-center justify-between px-4 border-t border-[#E4EAE9] hover:text-text-dark/60 transition-colors"
          >
            <span>{expanded ? "收起留言" : "更多留言"}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={cn("transition-transform duration-300", expanded && "rotate-180")}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>

          {/* 隱藏留言：用 grid-rows 做高度動畫 */}
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-5 px-4 pt-2 pb-4">
                {hiddenComments.map(renderCommentBlock)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
