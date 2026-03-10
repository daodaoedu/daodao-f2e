"use client";

import { DialogOutlineSvg } from "@daodao/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { cn } from "@daodao/ui/lib/utils";
import { MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";
import { ReactionPickerButton } from "./reaction-picker-button";

const PREVIEW_COUNT = 2;

// ============================================================================
// Types
// ============================================================================

export interface ICommentAuthor {
  name: string;
  photoURL?: string;
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
// CommentBubble (single comment or reply)
// ============================================================================

interface CommentBubbleProps {
  comment: IComment | ICommentReply;
  isReply?: boolean;
  onReply?: () => void;
  isOwn?: boolean;
  onEdit?: (id: string, content: string) => Promise<unknown> | unknown;
  onDelete?: (id: string) => Promise<unknown> | unknown;
}

function CommentBubble({
  comment,
  isReply = false,
  onReply,
  isOwn = false,
  onEdit,
  onDelete,
}: CommentBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [commentReactions, setCommentReactions] = useState<ReactionTypeType[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
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
    if (result === false) {
      toast.error("更新留言失敗，請再試一次");
      return;
    }
    toast.success("已更新留言");
    setEditing(false);
  };

  const avatarSizeClass = isReply ? "size-8" : "size-10";
  const authorTextClass = isReply ? "text-xs" : "text-sm";
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
          <span className={cn("font-semibold text-[#295E5C]", authorTextClass)}>
            {comment.author.name}
          </span>
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
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              // biome-ignore lint/a11y/noAutofocus: intentional UX for inline edit
              autoFocus
              rows={3}
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
          <p
            className={cn(
              "text-[#295E5C] leading-5 whitespace-pre-wrap",
              isReply ? "text-xs" : "text-sm"
            )}
          >
            {isReply && (
              <span className="mr-1 rounded-full bg-[#E8FAF9] px-2 py-0.5 text-[11px] font-medium text-[#2B6E6B]">
                回覆
              </span>
            )}
            {comment.content}
          </p>
        )}

        {/* Actions: 👍 + 💬 (hidden while editing) */}
        {!editing && (
          <div className="flex items-center gap-3 mt-1.5">
            <ReactionPickerButton
              selectedReactions={commentReactions}
              onToggle={(type) =>
                setCommentReactions((prev) => (prev.includes(type) ? [] : [type]))
              }
              variant="comment"
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
  onSubmit: (content: string, reactions: ReactionTypeType[], parentId?: string) => void;
  /** 是否顯示「更多留言」摺疊按鈕 */
  hasMoreComments?: boolean;
  /** 當前登入用戶的名稱，用於判斷是否為自己的留言 */
  currentUserName?: string;
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
  currentUserPhotoURL,
  onEditComment,
  onDeleteComment,
}: CommentSectionProps) {
  const [inputValue, setInputValue] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState(false);
  const previewComments = hasMoreComments ? comments.slice(0, PREVIEW_COUNT) : comments;
  const hiddenComments = hasMoreComments ? comments.slice(PREVIEW_COUNT) : [];
  const hiddenCount = hiddenComments.length;
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef ?? internalRef;

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
    onSubmit(trimmed, selectedReactions);
    setInputValue("");
    setReplyTo(null);
  };

  const handleReplySubmit = (parentId: string) => {
    const replyValue = replyInputs[parentId] ?? "";
    const trimmed = replyValue.trim();
    if (!trimmed) return;
    onSubmit(trimmed, selectedReactions, parentId);
    setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
    setReplyTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col">
      {/* 主留言輸入框（置頂） */}
      <div className="bg-white border-b border-[#E4EAE9] flex gap-2 items-center px-4 py-3">
        {/* User avatar */}
        <Avatar className="size-9 shrink-0">
          {currentUserPhotoURL && (
            <AvatarImage src={currentUserPhotoURL} alt={currentUserName || "我"} />
          )}
          <AvatarFallback
            className={cn("text-sm font-medium text-text-dark", getAvatarColor("Me"))}
          >
            {(currentUserName || "我").slice(0, 1)}
          </AvatarFallback>
        </Avatar>

        {/* Input */}
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedReactions.length === 0 ? "寫下你的留言..." : ""}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-[#E4EAE9] bg-white px-4 py-2 text-sm text-[#295E5C] placeholder:text-[#9FB5B8] focus:outline-none focus:border-logo-cyan transition-colors h-10"
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
      {comments.length > 0 && (
        <div className="flex flex-col gap-5 px-4 pt-4 pb-2">
          {previewComments.map((comment) => (
            <div key={comment.id}>
              <CommentBubble
                comment={comment}
                onReply={() => setReplyTo(comment.id)}
                isOwn={!!currentUserName && comment.author.name === currentUserName}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
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
                    isOwn={!!currentUserName && reply.author.name === currentUserName}
                    onEdit={onEditComment}
                    onDelete={onDeleteComment}
                  />
                </div>
              ))}
              {/* Inline reply input */}
              {replyTo === comment.id && (
                <div className="pl-[40px] flex gap-2 items-center mt-3">
                  <textarea
                    className="flex-1 resize-none rounded-lg border border-[#E4EAE9] bg-white px-4 py-2 text-sm text-[#295E5C] placeholder:text-[#9FB5B8] focus:outline-none focus:border-logo-cyan transition-colors min-h-[40px]"
                    placeholder={`回覆 ${comment.author.name}...`}
                    rows={1}
                    value={replyInputs[comment.id] ?? ""}
                    onChange={(event) =>
                      setReplyInputs((prev) => ({
                        ...prev,
                        [comment.id]: event.target.value,
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleReplySubmit(comment.id);
                      }
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
          ))}
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
                {hiddenComments.map((comment) => (
                  <div key={comment.id}>
                    <CommentBubble
                      comment={comment}
                      onReply={() => setReplyTo(comment.id)}
                      isOwn={!!currentUserName && comment.author.name === currentUserName}
                      onEdit={onEditComment}
                      onDelete={onDeleteComment}
                    />
                    {comment.replies?.map((reply) => (
                      <div
                        key={reply.id}
                        className="mt-3 ml-6 pl-4 border-l border-[#E4EAE9] bg-[#F7FBFB] rounded-lg"
                      >
                        <CommentBubble
                          comment={reply}
                          isReply
                          isOwn={!!currentUserName && reply.author.name === currentUserName}
                          onEdit={onEditComment}
                          onDelete={onDeleteComment}
                        />
                      </div>
                    ))}
                    {replyTo === comment.id && (
                      <div className="pl-[40px] flex gap-2 items-center mt-3">
                        <textarea
                          className="flex-1 resize-none rounded-lg border border-[#E4EAE9] bg-white px-4 py-2 text-sm text-[#295E5C] placeholder:text-[#9FB5B8] focus:outline-none focus:border-logo-cyan transition-colors min-h-[40px]"
                          placeholder={`回覆 ${comment.author.name}...`}
                          rows={1}
                          value={replyInputs[comment.id] ?? ""}
                          onChange={(event) =>
                            setReplyInputs((prev) => ({
                              ...prev,
                              [comment.id]: event.target.value,
                            }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              handleReplySubmit(comment.id);
                            }
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
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
