"use client";

import { Button } from "@daodao/ui/components/button";
import { Lock, Pencil } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { PracticeStage } from "../hooks";
import { isEnded, useReflection } from "../hooks";

interface ReflectionSectionProps {
  stage: PracticeStage;
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  practiceId: string;
}

/**
 * 我的反思區塊
 * @description 四種子狀態：鎖定（未結束）／預覽（已結束但未寫）／編輯／已儲存
 */
export function ReflectionSection({
  stage,
  reflectionText,
  onReflectionChange,
  practiceId,
}: ReflectionSectionProps) {
  const ended = isEnded(stage);
  const { save, isSaving } = useReflection(practiceId);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(reflectionText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing || !textareaRef.current) return;
    textareaRef.current.focus();
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [isEditing]);

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  const handleStartEdit = () => {
    setDraft(reflectionText);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(reflectionText);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const success = await save(trimmed);
    if (success) {
      onReflectionChange(trimmed);
      setIsEditing(false);
    }
  };

  if (!ended) {
    return (
      <section className="mt-4 rounded-2xl border border-basic-200 bg-white p-5">
        <h2 className="text-[15px] font-semibold text-text-dark">我的反思</h2>
        <div className="mt-3 flex items-start gap-2 text-sm text-logo-gray">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>實踐結束後，你可以在這裡為這段旅程留下一句話。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-basic-200 bg-white p-5">
      <h2 className="text-[15px] font-semibold text-text-dark">我的反思</h2>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleTextareaChange}
            placeholder="這段旅程帶給你什麼樣的體會？"
            rows={3}
            className="w-full resize-none rounded-xl border border-basic-200 bg-very-light-gray p-3 text-sm leading-relaxed text-text-dark outline-none focus:border-logo-cyan"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              取消
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !draft.trim()}
            >
              儲存
            </Button>
          </div>
        </div>
      ) : reflectionText ? (
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
            編輯
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-logo-gray">趁著記憶還新鮮，寫下這段旅程給你的感受吧。</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleStartEdit}
          >
            寫下我的反思
          </Button>
        </div>
      )}
    </section>
  );
}
