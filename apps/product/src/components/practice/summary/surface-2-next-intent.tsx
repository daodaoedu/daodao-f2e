"use client";

import type { PracticeSummary } from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowUpRight, Check, ChevronDown, Lightbulb, Pencil, Sprout, Undo2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { isInsightUnlocked, useNextIntent } from "./hooks";

interface Surface2Props {
  summary: PracticeSummary;
  onSurfaceChange: (surface: 1 | 3) => void;
}

type NextIntentMode = "preview" | "edit" | "saved";

/**
 * Surface 2 — 接下來我想
 * @description 米黃色 hero + AI 洞察折疊參考 + 「接下來我想」黃色漸層卡（preview/edit/saved）+ 底部導航
 */
export function Surface2NextIntent({ summary, onSurfaceChange }: Surface2Props) {
  const unlocked = isInsightUnlocked(summary);
  const { save, isSaving } = useNextIntent(summary.practiceId);

  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [mode, setMode] = useState<NextIntentMode>(summary.nextIntent ? "saved" : "preview");
  const [nextIntentText, setNextIntentText] = useState(summary.nextIntent ?? "");
  const [draft, setDraft] = useState(summary.nextIntent ?? "");
  const [saveDraft, setSaveDraft] = useState(false);
  const [justSavedDraft, setJustSavedDraft] = useState(false);
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
    setDraft(nextIntentText);
    setJustSavedDraft(false);
    setMode("edit");
  };

  const handleCancel = () => {
    setDraft(nextIntentText);
    setMode(nextIntentText ? "saved" : "preview");
  };

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await save(trimmed, saveDraft);
    setNextIntentText(trimmed);
    setJustSavedDraft(saveDraft);
    setMode("saved");
  };

  return (
    <main className="mx-auto max-w-[448px] px-5 pb-24 pt-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-8 text-center">
        <div className="mx-auto flex size-[52px] items-center justify-center rounded-2xl bg-white/70">
          <Sprout className="size-7 text-amber-700" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-text-dark">為下一段實踐留下方向</h1>
        <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-logo-gray">
          趁這份完成感還新鮮，寫下你想嘗試的方向。不用完整，一句話也可以。
        </p>
      </section>

      {/* AI insight reference（折疊） */}
      {unlocked ? (
        <section className="mt-4 overflow-hidden rounded-2xl border border-basic-200 bg-white">
          <button
            type="button"
            onClick={() => setIsInsightOpen((prev) => !prev)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary-lightest">
              <Lightbulb className="size-4 text-logo-cyan" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-text-dark">AI 洞察可作參考</span>
              <span className="mt-0.5 block text-xs text-logo-gray">
                這段實踐的觀察，點開可參考
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-[18px] shrink-0 text-basic-300 transition-transform duration-200",
                isInsightOpen && "rotate-180"
              )}
            />
          </button>
          {isInsightOpen && (
            <div className="border-t border-basic-100 px-4 pb-4 pt-3">
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-logo-gray">
                {summary.insight}
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-basic-200 bg-white px-4 py-3.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-very-light-gray">
            <Lightbulb className="size-4 text-basic-300" />
          </span>
          <span>
            <span className="block text-[13px] font-medium text-logo-gray">
              這次沒有 AI 洞察可參考
            </span>
            <span className="mt-0.5 block text-xs text-logo-gray/70">直接寫下你想做什麼也很好</span>
          </span>
        </section>
      )}

      {/* 接下來我想 主卡片 */}
      <section className="mt-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white shadow-sm">
            <Sprout className="size-[18px] text-logo-cyan" />
          </span>
          <span className="text-[15px] font-semibold text-text-dark">接下來我想</span>
          {mode === "saved" && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="ml-auto flex items-center gap-1 text-xs text-logo-gray"
            >
              <Pencil className="size-3" />
              編輯
            </button>
          )}
        </div>

        {mode === "preview" && (
          <div className="mt-3">
            <p className="text-sm leading-relaxed text-logo-gray">
              趁這份完成感還新鮮，為自己寫下一個方向。不用完整，一句話也可以。
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3.5 w-full gap-1.5 bg-white"
              onClick={handleStartEdit}
            >
              <Pencil className="size-3.5" />
              寫下接下來我想做的
            </Button>
          </div>
        )}

        {mode === "edit" && (
          <div className="mt-3 space-y-3">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={handleTextareaChange}
              placeholder="可以參考上面的 AI 洞察，或回顧你的打卡⋯⋯"
              rows={3}
              className="w-full resize-none rounded-xl border border-amber-200 bg-white p-3 text-sm leading-relaxed text-text-dark outline-none focus:border-logo-cyan"
            />
            <label
              htmlFor="next-intent-save-draft"
              className="flex items-center gap-2 text-xs text-logo-gray"
            >
              <Checkbox
                id="next-intent-save-draft"
                checked={saveDraft}
                onCheckedChange={(checked) => setSaveDraft(checked === true)}
              />
              存成草稿，之後再設定
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-white"
                onClick={handleCancel}
                disabled={isSaving}
              >
                取消
              </Button>
              <Button
                type="button"
                className="flex-[2]"
                onClick={handleSave}
                disabled={isSaving || !draft.trim()}
              >
                儲存
              </Button>
            </div>
          </div>
        )}

        {mode === "saved" && (
          <div className="mt-3">
            <div className="rounded-[14px] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,.04)]">
              <blockquote className="text-[15px] italic leading-[1.8] text-text-dark">
                {nextIntentText}
              </blockquote>
              <div className="mt-3.5 flex items-center gap-1.5 border-t border-dashed border-amber-200 pt-3">
                <Check className="size-[15px] text-logo-cyan" />
                <span className="text-xs text-logo-gray">已記下 ✓</span>
              </div>
            </div>
            {justSavedDraft && (
              <p className="mt-2 text-center text-xs text-logo-gray">
                已存成草稿，之後可以在草稿列表找到它
              </p>
            )}
          </div>
        )}
      </section>

      {/* 底部導航 */}
      <div className="mt-5 flex gap-2.5">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={() => onSurfaceChange(1)}
        >
          <Undo2 className="size-3.5" />
          回到總結頁
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-1.5 bg-white"
          onClick={() => onSurfaceChange(3)}
        >
          <ArrowUpRight className="size-3.5" />
          製作分享卡
        </Button>
      </div>
    </main>
  );
}
