"use client";

import { submitPersonaAnswer, useMutate, usePersonaProfileMe } from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useState } from "react";

interface InlineAnswerFormProps {
  questionId: number;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  onSuccess: () => void;
}

function InlineAnswerForm({ questionId, questionType, options, onSuccess }: InlineAnswerFormProps) {
  const t = useTranslations("persona");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isChoice = questionType === "choice" && options && options.length > 0;

  const handleSubmit = async () => {
    const body = isChoice
      ? { questionId, selectedValue: selectedValue || undefined }
      : { questionId, textAnswer: textAnswer.trim() || undefined };

    if (isChoice && !selectedValue) {
      toast.error(t("myProfile.selectRequired"));
      return;
    }
    if (!isChoice && !textAnswer.trim()) {
      toast.error(t("myProfile.textRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitPersonaAnswer(body);
      if (res.error) {
        toast.error(t("myProfile.submitError"));
        return;
      }
      onSuccess();
    } catch {
      toast.error(t("myProfile.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (isChoice) {
    return (
      <div className="flex flex-col gap-3 mt-3">
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <Button
              key={opt}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedValue(opt)}
              className={cn(
                "rounded-full border text-sm h-auto py-1.5 px-3",
                selectedValue === opt
                  ? "bg-logo-cyan text-white border-logo-cyan hover:bg-logo-cyan hover:text-white"
                  : "border-gray-300 text-gray-700 hover:border-logo-cyan/40 hover:text-gray-700"
              )}
            >
              {opt}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={submitting || !selectedValue}>
          {submitting ? t("myProfile.submitting") : t("myProfile.submit")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-3">
      <Textarea
        value={textAnswer}
        onChange={(e) => setTextAnswer(e.target.value)}
        placeholder={t("myProfile.textPlaceholder")}
        rows={3}
        maxLength={300}
      />
      <Button size="sm" onClick={handleSubmit} disabled={submitting || !textAnswer.trim()}>
        {submitting ? t("myProfile.submitting") : t("myProfile.submit")}
      </Button>
    </div>
  );
}

export function PersonaProfileMe() {
  const t = useTranslations("persona");
  const locale = useLocale();
  const { data, isLoading } = usePersonaProfileMe(locale);
  const mutate = useMutate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAllUnanswered, setShowAllUnanswered] = useState(false);

  const handleAnswerSuccess = async () => {
    await mutate(["/api/v1/persona/profile/me"] as const);
    setExpandedId(null);
    toast.success(t("myProfile.submitSuccess"));
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-400">{t("myProfile.loading")}</div>;
  }

  const questions = data?.data?.questions ?? [];
  const answered = questions.filter((q) => !q.isPlaceholder);
  const unanswered = questions.filter((q) => q.isPlaceholder);
  const unansweredVisible = showAllUnanswered ? unanswered : unanswered.slice(0, 3);

  return (
    <div className="flex flex-col gap-3 py-4">
      {/* 進度提示 */}
      {questions.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {t("myProfile.progress", { answered: answered.length, total: questions.length })}
        </p>
      )}

      {/* 已答題目 */}
      {answered.map((q) => (
        <div key={q.id} className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">{q.prompt}</p>
          <p className="text-sm font-medium text-gray-800">
            {q.answer?.selectedValue ?? q.answer?.textAnswer ?? ""}
          </p>
          {(q.answer?.resonanceCount ?? 0) > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              ✦ {q.answer?.resonanceCount} {t("myProfile.resonances")}
            </p>
          )}
        </div>
      ))}

      {/* 未答題目 */}
      {unanswered.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {answered.length === 0 && (
            <p className="text-xs text-gray-400 mb-1">{t("myProfile.startPrompt")}</p>
          )}
          {unansweredVisible.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className={cn(
                  "rounded-xl border border-dashed transition-all",
                  isExpanded
                    ? "border-primary-base bg-white/60"
                    : "border-basic-200 bg-white/30 hover:border-primary-base/50 hover:bg-white/40"
                )}
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-left justify-start h-auto p-3 rounded-xl hover:bg-transparent"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <span className="flex items-center justify-between w-full gap-2">
                    <span className="text-sm text-gray-500">{q.prompt}</span>
                    {!isExpanded && (
                      <span className="text-xs text-primary-base shrink-0">
                        {t("myProfile.clickToAnswer")}
                      </span>
                    )}
                  </span>
                </Button>
                {isExpanded && (
                  <div className="px-3 pb-3">
                    <InlineAnswerForm
                      questionId={q.id}
                      questionType={q.questionType}
                      options={q.options}
                      onSuccess={() => handleAnswerSuccess()}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {unanswered.length > 3 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-center text-xs text-gray-400 hover:text-gray-600 h-auto py-1"
              onClick={() => setShowAllUnanswered((v) => !v)}
            >
              {showAllUnanswered
                ? t("myProfile.showLess")
                : t("myProfile.showMore", { count: unanswered.length - 3 })}
            </Button>
          )}
        </div>
      )}

      {questions.length === 0 && (
        <div className="py-8 text-center text-gray-400">{t("myProfile.empty")}</div>
      )}
    </div>
  );
}
