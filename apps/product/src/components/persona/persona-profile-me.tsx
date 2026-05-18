"use client";

import { submitPersonaAnswer, useMutate, usePersonaProfileMe } from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { useTranslations } from "next-intl";
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
            <button
              key={opt}
              type="button"
              onClick={() => setSelectedValue(opt)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-sm transition-colors",
                selectedValue === opt
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 text-gray-700 hover:border-blue-400"
              )}
            >
              {opt}
            </button>
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
  const { data, isLoading } = usePersonaProfileMe();
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
            <button
              type="button"
              key={q.id}
              className={cn(
                "w-full text-left rounded-xl border-2 border-dashed border-gray-300 p-4 cursor-pointer transition-colors",
                isExpanded ? "border-blue-400 bg-blue-50" : "hover:border-blue-300 hover:bg-gray-50"
              )}
              onClick={() => setExpandedId(isExpanded ? null : q.id)}
            >
              <p className="text-sm text-gray-500 font-medium">{q.prompt}</p>
              {isExpanded && (
                <InlineAnswerForm
                  questionId={q.id}
                  questionType={q.questionType}
                  options={q.options}
                  onSuccess={() => handleAnswerSuccess()}
                />
              )}
              {!isExpanded && (
                <p className="text-xs text-blue-400 mt-2">{t("myProfile.clickToAnswer")}</p>
              )}
            </button>
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
