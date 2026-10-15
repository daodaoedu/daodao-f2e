"use client";

import type { ChatMessageType } from "@daodao/api";
import { editChatMessage, selectChatErrorMessage, sendChatMessage } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useCompositionState } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Pencil, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatInputProps {
  roomId: number;
  replyTo?: ChatMessageType | null;
  editingMessage?: ChatMessageType | null;
  onClearReply?: () => void;
  onClearEdit?: () => void;
  onMessageSent?: () => void;
  onMessageEdited?: () => void;
}

export function ChatInput({
  roomId,
  replyTo,
  editingMessage,
  onClearReply,
  onClearEdit,
  onMessageSent,
  onMessageEdited,
}: ChatInputProps) {
  const t = useTranslations("messages");
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isComposing, compositionProps } = useCompositionState();

  useEffect(() => {
    if (editingMessage) {
      setValue(editingMessage.body);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  const resetInput = useCallback(() => {
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      if (editingMessage) {
        const response = await editChatMessage(roomId, editingMessage.id, trimmed);
        if (response.error) {
          toast.error(selectChatErrorMessage(response.error, t("send_failed")));
          return;
        }
        resetInput();
        onClearEdit?.();
        onMessageEdited?.();
      } else {
        const response = await sendChatMessage(roomId, trimmed, replyTo?.id);
        if (response.error) {
          toast.error(selectChatErrorMessage(response.error, t("send_failed")));
          return;
        }
        resetInput();
        onClearReply?.();
        onMessageSent?.();
      }
    } catch {
      toast.error(t("send_failed"));
    } finally {
      setSending(false);
    }
  }, [
    value,
    sending,
    roomId,
    editingMessage,
    replyTo?.id,
    onClearReply,
    onClearEdit,
    onMessageSent,
    onMessageEdited,
    resetInput,
    t,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (isComposing) return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSubmit();
      }
      if (e.key === "Escape" && editingMessage) {
        onClearEdit?.();
        resetInput();
      }
    },
    [isComposing, handleSubmit, editingMessage, onClearEdit, resetInput]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  const handleCancelEdit = useCallback(() => {
    onClearEdit?.();
    resetInput();
  }, [onClearEdit, resetInput]);

  const hasContext = !!editingMessage || !!replyTo;
  const canSend = !!value.trim() && !sending;

  // POC 訊息.dc.html：輸入區最寬 720 置中、圓角輸入框、回覆／編輯提示列接在輸入框上方、下方快捷鍵提示
  return (
    <div
      data-chat-composer
      className="sticky bottom-0 shrink-0 bg-[linear-gradient(to_top,oklch(0.992_0.011_182.9)_55%,transparent)] px-7 pt-3 pb-5"
    >
      <div className="mx-auto max-w-[720px]">
        {/* Edit mode bar */}
        {editingMessage && (
          <div className="-mb-px flex items-center gap-2.5 rounded-t-[18px] border border-b-0 border-[#E4EAE9] bg-white px-4 py-2">
            <Pencil className="size-3.5 shrink-0 text-[oklch(0.711_0.12_190.6)]" aria-hidden />
            <span className="min-w-0 flex-1 text-xs font-semibold text-[oklch(0.711_0.12_190.6)]">
              {t("edit_mode_label")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelEdit}
              aria-label={t("delete_cancel")}
              className="size-[26px] shrink-0 rounded-full text-[oklch(0.445_0.056_192/0.45)] hover:bg-[oklch(0.962_0.032_211.1)] [&_svg]:size-3.5"
            >
              <X />
            </Button>
          </div>
        )}

        {/* Reply bar */}
        {replyTo && !editingMessage && (
          <div className="-mb-px flex items-center gap-2.5 rounded-t-[18px] border border-b-0 border-[#E4EAE9] bg-white px-4 py-2">
            <span className="h-[26px] w-[3px] shrink-0 rounded-full bg-[oklch(0.711_0.12_190.6)]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-[oklch(0.711_0.12_190.6)]">
                {t("reply_to", { name: replyTo.author?.nickname ?? "" })}
              </span>
              <span className="block truncate text-xs text-[oklch(0.445_0.056_192/0.6)]">
                {replyTo.body}
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearReply}
              aria-label={t("delete_cancel")}
              className="size-[26px] shrink-0 rounded-full text-[oklch(0.445_0.056_192/0.45)] hover:bg-[oklch(0.962_0.032_211.1)] [&_svg]:size-3.5"
            >
              <X />
            </Button>
          </div>
        )}

        {/* Composer */}
        <div
          className={cn(
            "flex items-end gap-2.5 border border-[#E4EAE9] bg-white py-1.5 pr-2 pl-[18px] shadow-[0_2px_8px_rgba(15,48,54,0.05)]",
            hasContext ? "rounded-[0_0_18px_18px]" : "rounded-[22px]"
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onCompositionStart={compositionProps.onCompositionStart}
            onCompositionEnd={compositionProps.onCompositionEnd}
            placeholder={t("input_placeholder")}
            rows={1}
            className="max-h-[120px] min-w-0 flex-1 resize-none overflow-hidden border-0 bg-transparent py-2 text-sm leading-[1.7] text-[oklch(0.445_0.056_192)] outline-none placeholder:text-[oklch(0.445_0.056_192/0.4)]"
          />
          <Button
            size="icon"
            onClick={() => void handleSubmit()}
            disabled={!canSend}
            className={cn(
              "mb-px size-[38px] shrink-0 rounded-full border-0 disabled:opacity-100 [&_svg]:size-[18px]",
              canSend
                ? "bg-[oklch(0.711_0.12_190.6)] text-white hover:bg-[oklch(0.711_0.12_190.6)]"
                : "bg-[oklch(0.962_0.032_211.1)] text-[oklch(0.445_0.056_192/0.4)]"
            )}
            aria-label={editingMessage ? t("edit_action") : t("send")}
          >
            <Send />
          </Button>
        </div>
        <p className="mx-1 mt-2 mb-0 text-[11px] text-[oklch(0.445_0.056_192/0.4)]">
          {t("input_hint")}
        </p>
      </div>
    </div>
  );
}
