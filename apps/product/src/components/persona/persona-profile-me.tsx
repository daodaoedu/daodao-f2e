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
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-500 hover:text-white"
                  : "border-gray-300 text-gray-700 hover:border-blue-400 hover:text-gray-700"
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

  const handleAnswerSuccess = async () => {
    await mutate(["/api/v1/persona/profile/me"] as const);
    setExpandedId(null);
    toast.success(t("myProfile.submitSuccess"));
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-400">{t("myProfile.loading")}</div>;
  }

  const questions = data?.data?.questions ?? [];

  return (
    <div className="flex flex-col gap-4 py-4">
      {questions.map((q) => {
        const isExpanded = expandedId === q.id;

        if (q.isPlaceholder) {
          return (
            <div
              key={q.id}
              className={cn(
                "rounded-xl border-2 border-dashed border-gray-300 transition-colors",
                isExpanded ? "border-blue-400 bg-blue-50" : "hover:border-blue-300"
              )}
            >
              <Button
                type="button"
                variant="ghost"
                className="w-full text-left justify-start h-auto p-4 rounded-xl hover:bg-transparent"
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
              >
                <span className="flex flex-col items-start gap-1">
                  <span className="text-sm text-gray-500 font-medium">{q.prompt}</span>
                  {!isExpanded && (
                    <span className="text-xs text-blue-400">{t("myProfile.clickToAnswer")}</span>
                  )}
                </span>
              </Button>
              {isExpanded && (
                <div className="px-4 pb-4">
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
        }

        return (
          <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{q.prompt}</p>
            <p className="text-base font-medium text-gray-800">
              {q.answer?.selectedValue ?? q.answer?.textAnswer ?? ""}
            </p>
            {(q.answer?.resonanceCount ?? 0) > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                ✦ {q.answer?.resonanceCount} {t("myProfile.resonances")}
              </p>
            )}
          </div>
        );
      })}

      {questions.length === 0 && (
        <div className="py-8 text-center text-gray-400">{t("myProfile.empty")}</div>
      )}
    </div>
  );
}
