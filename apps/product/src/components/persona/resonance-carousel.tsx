"use client";

import {
  dismissPersonaCarousel,
  submitPersonaAnswer,
  useMutate,
  usePersonaCarouselState,
} from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@daodao/ui/components/carousel";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface CarouselQuestionCardProps {
  questionId: number;
  prompt: string;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  isLocked: boolean;
  onAnswered: () => void;
  onSwitch: (questionId: number) => void;
}

function CarouselQuestionCard({
  questionId,
  prompt,
  questionType,
  options,
  isLocked,
  onAnswered,
  onSwitch,
}: CarouselQuestionCardProps) {
  const t = useTranslations("persona.carousel");
  const tProfile = useTranslations("persona.myProfile");
  const [selected, setSelected] = useState("");
  const [textValue, setTextValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isChoice = questionType === "choice" && options && options.length > 0;

  const handleSubmit = async () => {
    const body = isChoice
      ? { questionId, selectedValue: selected || undefined }
      : { questionId, textAnswer: textValue.trim() || undefined };

    if (isChoice && !selected) return;
    if (!isChoice && !textValue.trim()) return;

    setSubmitting(true);
    try {
      const res = await submitPersonaAnswer(body);
      if (res.error) {
        toast.error(tProfile("submitError"));
        return;
      }
      onAnswered();
    } catch {
      toast.error(tProfile("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm relative",
        isLocked && "opacity-50 pointer-events-none select-none"
      )}
    >
      {isLocked && (
        <div className="absolute inset-0 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <p className="text-sm text-gray-500 text-center px-4">{tProfile("textPlaceholder")}</p>
        </div>
      )}
      <p className="text-sm font-medium text-gray-700 mb-3">{prompt}</p>

      {isChoice ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(opt)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-sm transition-colors",
                selected === opt
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 text-gray-700 hover:border-blue-400"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder={tProfile("textPlaceholder")}
          rows={2}
          maxLength={300}
          className="w-full text-sm border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 mb-3"
        />
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => onSwitch(questionId)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {t("switchQuestion")}
        </button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitting || (isChoice ? !selected : !textValue.trim())}
        >
          {submitting ? tProfile("submitting") : tProfile("submit")}
        </Button>
      </div>
    </div>
  );
}

export function ResonanceCarousel() {
  const t = useTranslations("persona.carousel");
  const tProfile = useTranslations("persona.myProfile");
  const mutate = useMutate();
  const [replaceId, setReplaceId] = useState<number | undefined>(undefined);
  const [dismissing, setDismissing] = useState(false);

  const { data, isLoading } = usePersonaCarouselState(replaceId);

  const shouldShow = data?.data?.shouldShow;
  const questions = data?.data?.questions ?? [];

  // answeredCount is not directly available, use questions.length as proxy for lock check
  // viewerIsLocked based on how many questions the user has answered
  // The carousel shows the user's own unanswered questions, so no lock concept here
  // Lock (task 7.2) would apply if showing others' resonances — skip for this implementation

  if (isLoading || !shouldShow) return null;

  const handleDismiss = async () => {
    setDismissing(true);
    try {
      await dismissPersonaCarousel();
      await mutate(["/api/v1/persona/carousel-state"] as const);
    } catch {
      toast.error("操作失敗，請稍後再試");
    } finally {
      setDismissing(false);
    }
  };

  const handleAnswered = async () => {
    await mutate(["/api/v1/persona/carousel-state"] as const);
    toast.success(tProfile("submitSuccess"));
  };

  const handleSwitch = (questionId: number) => {
    setReplaceId(questionId);
  };

  if (questions.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold text-gray-700">學習人物誌</p>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={dismissing}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {t("dismiss")}
        </button>
      </div>

      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {questions.map((q) => (
            <CarouselItem key={q.id} className="basis-5/6 md:basis-1/2">
              <CarouselQuestionCard
                questionId={q.id}
                prompt={q.prompt}
                questionType={q.questionType}
                options={q.options}
                isLocked={false}
                onAnswered={handleAnswered}
                onSwitch={handleSwitch}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
