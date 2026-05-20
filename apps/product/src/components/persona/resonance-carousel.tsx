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
} from "@daodao/ui/components/carousel";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useState } from "react";

interface CarouselQuestionCardProps {
  questionId: number;
  prompt: string;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  onAnswered: () => void;
  onSwitch: (questionId: number) => void;
}

function CarouselQuestionCard({
  questionId,
  prompt,
  questionType,
  options,
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
      setSelected("");
      setTextValue("");
      onAnswered();
    } catch {
      toast.error(tProfile("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-700 mb-3">{prompt}</p>

      {isChoice ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {options.map((opt) => (
            <Button
              key={opt}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelected(opt)}
              className={cn(
                "rounded-full border text-sm h-auto py-1.5 px-3",
                selected === opt
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-500 hover:text-white"
                  : "border-gray-300 text-gray-700 hover:border-blue-400 hover:text-gray-700"
              )}
            >
              {opt}
            </Button>
          ))}
        </div>
      ) : (
        <Textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder={tProfile("textPlaceholder")}
          rows={2}
          maxLength={300}
          className="mb-3 resize-none"
        />
      )}

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSwitch(questionId)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {t("switchQuestion")}
        </Button>
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
  const locale = useLocale();
  const mutate = useMutate();
  const [replaceId, setReplaceId] = useState<number | undefined>(undefined);
  const [dismissing, setDismissing] = useState(false);

  const { data, isLoading } = usePersonaCarouselState(replaceId, locale);

  const shouldShow = data?.data?.shouldShow;
  const questions = data?.data?.questions ?? [];

  if (isLoading || !shouldShow) return null;

  const handleDismiss = async () => {
    setDismissing(true);
    try {
      const res = await dismissPersonaCarousel();
      if (res.error) {
        toast.error(t("error"));
        return;
      }
      await mutate(["/api/v1/persona/carousel-state"] as const);
    } catch {
      toast.error(t("error"));
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
        <p className="text-sm font-semibold text-gray-700">{t("title")}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          disabled={dismissing}
          className="text-xs text-gray-400 hover:text-gray-600 h-auto p-0"
        >
          {t("dismiss")}
        </Button>
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
                onAnswered={handleAnswered}
                onSwitch={handleSwitch}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
