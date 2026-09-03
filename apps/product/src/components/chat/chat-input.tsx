"use client";

import type { ChatMessageType } from "@daodao/api";
import { sendChatMessage } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useCompositionState } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Send, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface ChatInputProps {
  roomId: number;
  replyTo?: ChatMessageType | null;
  onClearReply?: () => void;
  onMessageSent?: () => void;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ChatInput({
  roomId,
  replyTo,
  onClearReply,
  onMessageSent,
  disabled = false,
}: ChatInputProps) {
  const t = useTranslations("messages");
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isComposing, compositionProps } = useCompositionState();

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await sendChatMessage(roomId, trimmed, replyTo?.id);
      setValue("");
      onClearReply?.();
      onMessageSent?.();
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      toast.error(t("send_failed"));
    } finally {
      setSending(false);
    }
  }, [value, sending, roomId, replyTo?.id, onClearReply, onMessageSent, t]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (isComposing) return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [isComposing, handleSubmit]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  if (disabled) {
    return (
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[#E4EAE9] px-4 py-3">
        <p className="text-sm text-text-dark/40 text-center">{t("read_only")}</p>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[#E4EAE9]">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 pt-2 pb-1">
          <div className="flex-1 min-w-0 border-l-2 border-logo-cyan/40 pl-2">
            <p className="text-[11px] font-medium text-text-dark/60">
              {t("reply_to", { name: replyTo.author?.nickname ?? "" })}
            </p>
            <p className="text-xs text-text-dark/40 truncate">{replyTo.body}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearReply}
            className="size-6 shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 px-4 py-3">
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
          className={cn(
            "flex-1 resize-none overflow-hidden rounded-xl border border-[#E4EAE9] bg-[#F7FBFB] px-4 py-2.5 text-sm text-text-dark",
            "placeholder:text-text-dark/30 focus:outline-none focus:border-logo-cyan transition-colors",
            "min-h-[40px] max-h-[120px]"
          )}
        />
        <Button
          size="icon"
          onClick={() => void handleSubmit()}
          disabled={!value.trim() || sending}
          className="shrink-0 size-10 rounded-full bg-logo-cyan hover:bg-logo-cyan/80 disabled:opacity-40"
          aria-label={t("send")}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
