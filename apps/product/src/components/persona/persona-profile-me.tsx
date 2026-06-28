"use client";

import { submitPersonaAnswer, useMutate, usePersonaProfileMe } from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { RefreshCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { buildPersonaAnswerBody } from "./other-option-utils";

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
  const [isCustomAnswer, setIsCustomAnswer] = useState(false);
  const [customText, setCustomText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isChoice = questionType === "choice" && options != null && options.length > 0;

  const handleSubmit = async () => {
    if (isChoice) {
      if (!isCustomAnswer && !selectedValue) {
        toast.error(t("myProfile.selectRequired"));
        return;
      }
      if (isCustomAnswer && !customText.trim()) {
        toast.error(t("myProfile.textRequired"));
        return;
      }
    } else if (!textAnswer.trim()) {
      toast.error(t("myProfile.textRequired"));
      return;
    }

    const body = buildPersonaAnswerBody(
      questionId,
      !!isChoice,
      selectedValue,
      textAnswer,
      isCustomAnswer,
      customText
    );

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
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setSelectedValue(opt);
                setIsCustomAnswer(false);
                setCustomText("");
              }}
              className={cn(
                "rounded-xl border-2 text-sm text-left py-3 px-4 transition-all leading-snug",
                !isCustomAnswer && selectedValue === opt
                  ? "border-logo-cyan bg-logo-cyan/10 text-logo-cyan font-medium"
                  : "border-[#E8F8FF] text-text-dark/65 hover:border-logo-cyan/40"
              )}
            >
              {opt}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setSelectedValue("");
              setIsCustomAnswer(true);
            }}
            className={cn(
              "rounded-xl border-2 text-sm text-left py-3 px-4 transition-all leading-snug",
              isCustomAnswer
                ? "border-logo-cyan bg-logo-cyan/10 text-logo-cyan font-medium"
                : "border-[#E8F8FF] text-text-dark/65 hover:border-logo-cyan/40"
            )}
          >
            {t("myProfile.otherOption")}
          </button>
        </div>
        {isCustomAnswer && (
          <Textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t("myProfile.textPlaceholder")}
            rows={3}
            maxLength={300}
          />
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={
            submitting ||
            (!isCustomAnswer && !selectedValue) ||
            (isCustomAnswer && !customText.trim())
          }
        >
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleAnswerSuccess = async () => {
    await mutate(["/api/v1/persona/profile/me"] as const);
    setExpandedId(null);
    toast.success(t("myProfile.submitSuccess"));
  };

  const questions = useMemo(() => data?.data?.questions ?? [], [data]);
  const answered = useMemo(() => questions.filter((q) => !q.isPlaceholder), [questions]);

  const handleNextQuestion = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % questions.length);
    setExpandedId(null);
  }, [questions.length]);

  if (isLoading) {
    return <div className="py-8 text-center text-gray-400">{t("myProfile.loading")}</div>;
  }

  if (questions.length === 0) {
    return <div className="py-8 text-center text-gray-400">{t("myProfile.empty")}</div>;
  }

  const safeIndex = currentIndex % questions.length;
  const currentQuestion = questions[safeIndex];
  if (!currentQuestion) return null;

  const isAnswered = !currentQuestion.isPlaceholder;
  const isExpanded = expandedId === currentQuestion.id;

  return (
    <div className="flex flex-col gap-3 py-4">
      {/* Progress */}
      <p className="text-xs text-gray-400 text-right">
        {t("myProfile.progress", { answered: answered.length, total: questions.length })}
      </p>

      {/* Single question card */}
      {isAnswered ? (
        <CustomLink
          href={`/persona/${currentQuestion.id}`}
          className="block rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow w-full text-left"
        >
          <p className="text-xs text-gray-400 mb-1">{currentQuestion.prompt}</p>
          <p className="text-sm font-medium text-gray-800">
            {currentQuestion.answer?.selectedValue ?? currentQuestion.answer?.textAnswer ?? ""}
          </p>
          {(currentQuestion.answer?.resonanceCount ?? 0) > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              ✦ {currentQuestion.answer?.resonanceCount} {t("myProfile.resonances")}
            </p>
          )}
        </CustomLink>
      ) : (
        <div
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
            onClick={() => setExpandedId(isExpanded ? null : currentQuestion.id)}
          >
            <span className="flex items-center justify-between w-full gap-2">
              <span className="text-sm text-gray-500">{currentQuestion.prompt}</span>
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
                questionId={currentQuestion.id}
                questionType={currentQuestion.questionType}
                options={currentQuestion.options}
                onSuccess={() => handleAnswerSuccess()}
              />
            </div>
          )}
        </div>
      )}

      {/* Switch question button */}
      {questions.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextQuestion}
            className="text-xs text-gray-400 hover:text-gray-600 h-auto py-1 gap-1"
          >
            <RefreshCcw className="size-3.5" />
            {t("userProfile.switchQuestion")}
          </Button>
        </div>
      )}
    </div>
  );
}
