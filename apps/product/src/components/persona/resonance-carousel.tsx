"use client";

import {
  dismissPersonaCarousel,
  submitPersonaAnswer,
  useCurrentUser,
  useMutate,
  usePersonaCarouselState,
} from "@daodao/api";
import { ArrowCircleSvg, QuoteFillSvg } from "@daodao/assets";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircle2, Laugh, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CarouselQuestion = {
  id: number;
  prompt: string;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  isNewUserPriority: boolean;
};

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [selected, setSelected] = useState("");
  const [textValue, setTextValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  const isChoice = questionType === "choice" && options && options.length > 0;
  const frontLabel = isChoice ? t("choicePrompt") : t("openPrompt");

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
      setSubmitted(true);
    } catch {
      toast.error(tProfile("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 h-[280px] flex flex-col items-center justify-center gap-2 px-6">
        <CheckCircle2 className="size-10 text-logo-cyan mb-1" />
        <p className="text-base font-medium text-text-dark">{t("submitted.title")}</p>
        <p className="text-sm text-text-dark/50 text-center leading-relaxed">
          {t("submitted.description")}
        </p>
        <button
          type="button"
          onClick={() => {
            onAnswered();
            const identifier = currentUser?.data?.customId ?? currentUser?.data?.id;
            if (identifier) router.push(`/users/${identifier}`);
          }}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-darker hover:opacity-80 transition-opacity"
        >
          {t("submitted.cta")}
          <ArrowCircleSvg className="size-6 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div style={{ perspective: "1000px", height: isChoice ? "360px" : "320px" }} className="w-full">
      <div
        className="relative w-full h-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — question */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction, contains interactive children */}
        <div
          className="group absolute inset-0 bg-white rounded-2xl px-6 pt-6 pb-5 shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 flex flex-col cursor-pointer select-none"
          style={{ backfaceVisibility: "hidden" }}
          onClick={() => setIsFlipped(true)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsFlipped(true); }}
        >
          <QuoteFillSvg className="mt-4 mb-4 self-center shrink-0 text-logo-cyan" />
          <p className="text-[24px] font-semibold text-text-dark text-center leading-snug flex-1 flex items-center justify-center overflow-hidden">
            {prompt}
          </p>
          <div className="flex items-center gap-2 self-end mt-3 transition-transform duration-200 group-hover:translate-x-1.5">
            <span className="text-sm text-primary-darker">{frontLabel}</span>
            <ArrowCircleSvg className="size-8 shrink-0" />
          </div>
        </div>

        {/* Back — answer form */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction, contains interactive children */}
        <div
          className="absolute inset-0 bg-white rounded-2xl px-6 pt-5 pb-6 shadow-sm border border-[#E8F8FF] flex flex-col cursor-pointer overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          onClick={() => setIsFlipped(false)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsFlipped(false); }}
        >
          <div className="flex items-start gap-2 shrink-0">
            <p className="text-sm text-primary-darker line-clamp-2 leading-relaxed flex-1">
              {prompt}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSwitch(questionId);
              }}
              className="shrink-0 -mt-0.5 -mr-1 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-text-dark/30 hover:text-text-dark/55 hover:bg-black/5 h-auto transition-colors"
            >
              <RefreshCw className="size-3" />
              {t("switchQuestion")}
            </Button>
          </div>

          {isChoice ? (
            <>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for option grid */}
              <div
                className="flex-1 grid grid-cols-2 gap-2 mt-4 min-w-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {options.map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(opt);
                    }}
                    className={cn(
                      "w-full min-w-0 whitespace-normal rounded-xl border-2 text-sm py-3 px-3 h-auto transition-all text-left leading-snug justify-start",
                      selected === opt
                        ? "border-logo-cyan bg-logo-cyan/10 text-logo-cyan font-medium hover:bg-logo-cyan/10 hover:text-logo-cyan"
                        : "border-[#E8F8FF] text-text-dark/65 hover:border-logo-cyan/40 hover:bg-transparent"
                    )}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for textarea area */}
              <div
                className="flex-1 flex items-center min-h-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <textarea
                  rows={2}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={tProfile("textPlaceholder")}
                  maxLength={300}
                  className="w-full border-0 border-b-2 border-logo-cyan text-base text-text-dark outline-none bg-transparent placeholder:text-text-dark/25 pb-1 resize-none"
                />
              </div>
            </>
          )}

          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();
            }}
            disabled={submitting || (isChoice ? !selected : !textValue.trim())}
            className={cn(
              "shrink-0 mt-4 w-full py-3 rounded-full font-medium text-base transition-all h-auto",
              !submitting && (isChoice ? selected : textValue.trim())
                ? "bg-[#F5A93E] text-white hover:bg-[#F5A93E]/90"
                : "bg-[#F5A93E]/30 text-white/70 cursor-not-allowed"
            )}
          >
            {submitting ? tProfile("submitting") : tProfile("submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ResonanceCarousel() {
  const t = useTranslations("persona.carousel");
  const locale = useLocale();
  const mutate = useMutate();
  const [replaceId, setReplaceId] = useState<number | undefined>(undefined);
  const [dismissing, setDismissing] = useState(false);
  const [displayedQuestions, setDisplayedQuestions] = useState<CarouselQuestion[]>([]);
  const lastProcessedReplaceId = useRef<number | undefined>(undefined);

  const { data, isLoading } = usePersonaCarouselState(replaceId, locale);

  const shouldShow = data?.data?.shouldShow;
  const apiQuestions = data?.data?.questions ?? [];

  // Populate on initial load
  useEffect(() => {
    if (displayedQuestions.length === 0 && apiQuestions.length > 0) {
      setDisplayedQuestions(apiQuestions.slice(0, 2));
    }
  }, [apiQuestions, displayedQuestions.length]);

  // After switch: update only the replaced card, leave the other unchanged
  useEffect(() => {
    if (replaceId == null || isLoading || apiQuestions.length === 0) return;
    if (lastProcessedReplaceId.current === replaceId) return;
    lastProcessedReplaceId.current = replaceId;
    const newQuestion = apiQuestions.find((q) => displayedQuestions.every((dq) => dq.id !== q.id));
    if (newQuestion) {
      setDisplayedQuestions((prev) => prev.map((q) => (q.id === replaceId ? newQuestion : q)));
    }
  }, [replaceId, isLoading, apiQuestions, displayedQuestions]);

  // Initial load with no data yet
  if (displayedQuestions.length === 0 && isLoading) return null;
  // Dismissed or shouldShow=false after fetch completes
  if (!isLoading && shouldShow === false) return null;
  if (displayedQuestions.length === 0) return null;

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
  };

  const handleSwitch = (questionId: number) => {
    setReplaceId(questionId);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-text-dark/60">
          <Laugh className="size-3.5 shrink-0" />
          <span>{t("title")}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          disabled={dismissing}
          className="text-xs text-text-dark/40 hover:text-text-dark/60 h-auto p-0"
        >
          {t("dismiss")}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {displayedQuestions.map((q) => (
          <CarouselQuestionCard
            key={q.id}
            questionId={q.id}
            prompt={q.prompt}
            questionType={q.questionType}
            options={q.options}
            onAnswered={handleAnswered}
            onSwitch={handleSwitch}
          />
        ))}
      </div>
    </div>
  );
}
