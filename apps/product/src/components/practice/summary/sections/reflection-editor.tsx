"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Pencil } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useReflection } from "../hooks";

type ReflectionMode = "preview" | "edit" | "saved";

interface ReflectionEditorProps {
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  practiceId: string;
  /** Compact mode for inline editing in Surface 3 (no section wrapper) */
  compact?: boolean;
}

/**
 * 反思編輯共用元件
 * @description 三種子狀態：預覽（尚未寫）／編輯／已儲存，供 Surface 1（區塊）與 Surface 3（分享卡內聯）共用
 */
export function ReflectionEditor({
  reflectionText,
  onReflectionChange,
  practiceId,
  compact = false,
}: ReflectionEditorProps) {
  const t = useTranslations("practice");
  const { save, isSaving } = useReflection(practiceId);

  const [mode, setMode] = useState<ReflectionMode>(() =>
    reflectionText.trim() ? "saved" : "preview"
  );
  const [draft, setDraft] = useState(reflectionText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode !== "edit" || !textareaRef.current) return;
    textareaRef.current.focus();
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [mode]);

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  const handleStartEdit = () => {
    setDraft(reflectionText);
    setMode("edit");
  };

  const handleCancel = () => {
    setDraft(reflectionText);
    setMode(reflectionText.trim() ? "saved" : "preview");
  };

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const success = await save(trimmed);
    if (success) {
      onReflectionChange(trimmed);
      setMode("saved");
    }
  };

  const editView = (
    <div className={compact ? "mt-2.5 space-y-2.5" : "mt-3 space-y-3"}>
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={handleTextareaChange}
        placeholder={t("summary_reflection_placeholder")}
        rows={3}
        className="w-full resize-none rounded-xl border border-basic-200 bg-very-light-gray p-3 text-sm leading-relaxed text-text-dark outline-none focus:border-logo-cyan"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
          {t("summary_cancel")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => void handleSave()}
          disabled={isSaving || !draft.trim()}
        >
          {t("summary_save")}
        </Button>
      </div>
    </div>
  );

  if (compact) {
    return mode === "edit" ? (
      editView
    ) : (
      <div className="mt-2 flex items-start justify-between gap-2">
        <p className="flex-1 text-sm italic leading-relaxed text-text-dark/80">
          {reflectionText.trim() || t("summary_reflection_no_text")}
        </p>
        <button
          type="button"
          onClick={handleStartEdit}
          className="flex shrink-0 items-center gap-1 text-xs text-logo-cyan"
        >
          <Pencil className="size-3" />
          {t("summary_edit")}
        </button>
      </div>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-basic-200 bg-white p-5">
      <h2 className="text-[15px] font-semibold text-text-dark">{t("summary_reflection_title")}</h2>

      {mode === "edit" ? (
        editView
      ) : mode === "saved" ? (
        <div className="mt-3">
          <blockquote className="border-l-2 border-primary-lighter pl-3 text-sm italic leading-[1.8] text-text-dark/80">
            {reflectionText}
          </blockquote>
          <button
            type="button"
            onClick={handleStartEdit}
            className="mt-2 flex items-center gap-1 text-xs text-logo-cyan"
          >
            <Pencil className="size-3.5" />
            {t("summary_edit")}
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-logo-gray">{t("summary_reflection_prompt")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleStartEdit}
          >
            {t("summary_reflection_write_cta")}
          </Button>
        </div>
      )}
    </section>
  );
}
