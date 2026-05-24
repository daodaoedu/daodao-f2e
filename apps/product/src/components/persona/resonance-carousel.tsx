"use client";

import {
  dismissPersonaCarousel,
  submitPersonaAnswer,
  useMutate,
  usePersonaCarouselState,
} from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { useLocale, useTranslations } from "@daodao/i18n";
import { CheckCircle2, Laugh, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "@daodao/i18n/navigation";

function QuoteSvg({ className }: { className?: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <title>引言符號</title>
      <path d="M51.4667 16.8C54.1333 19.7334 55.7333 22.9334 55.7333 28.2667C55.7333 37.6 49.0667 45.8667 39.7333 50.1334L37.3333 46.6667C46.1333 41.8667 48 35.7334 48.5333 31.7334C47.2 32.5334 45.3333 32.8 43.4667 32.5334C38.6667 32 34.9333 28.2667 34.9333 23.2C34.9333 20.8 36 18.4 37.6 16.5334C39.4667 14.6667 41.6 13.8667 44.2667 13.8667C47.2 13.8667 49.8667 15.2 51.4667 16.8ZM24.8 16.8C27.4667 19.7334 29.0667 22.9334 29.0667 28.2667C29.0667 37.6 22.4 45.8667 13.0667 50.1334L10.6667 46.6667C19.4667 41.8667 21.3333 35.7334 21.8667 31.7334C20.5333 32.5334 18.6667 32.8 16.8 32.5334C12 32 8.26666 28 8.26666 23.2C8.26666 20.8 9.33333 18.4 10.9333 16.5334C12.8 14.6667 14.9333 13.8667 17.6 13.8667C20.5333 13.8667 23.2 15.2 24.8 16.8Z" fill="#16B9B3"/>
    </svg>
  );
}

function ArrowCircleSvg({ className }: { className?: string }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <title>繼續箭頭</title>
      <circle cx="30" cy="30" r="30" fill="#F0FAFA"/>
      <path d="M42.0735 30.0176L30.4666 30.0194M30.45 30.0194L17.85 30.0194M30.45 17.4L41.3791 28.3296C41.8221 28.7727 42.071 29.3735 42.071 30C42.071 30.6265 41.8221 31.2274 41.3791 31.6704L30.45 42.6" stroke="#5C7080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

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
      onAnswered();
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
          onClick={() => router.push("/users/me")}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-darker hover:opacity-80 transition-opacity"
        >
          {t("submitted.cta")}
          <ArrowCircleSvg className="size-6 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div style={{ perspective: "1000px", height: isChoice ? "360px" : "280px" }} className="w-full">
      <div
        className="relative w-full h-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — question */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip interaction */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction */}
        <div
          className="group absolute inset-0 bg-white rounded-2xl px-6 pt-6 pb-5 shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 flex flex-col cursor-pointer select-none"
          style={{ backfaceVisibility: "hidden" }}
          onClick={() => setIsFlipped(true)}
        >
          <QuoteSvg className="mt-4 mb-3 self-center shrink-0 size-10 md:size-16" />
          <p className="text-lg md:text-[22px] font-semibold text-text-dark text-center leading-snug flex-1 flex items-center justify-center overflow-hidden">
            {prompt}
          </p>
          <div className="flex items-center gap-2 self-end mt-3 transition-transform duration-200 group-hover:translate-x-1.5">
            <span className="text-sm text-primary-darker">{frontLabel}</span>
            <ArrowCircleSvg className="size-8 shrink-0" />
          </div>
        </div>

        {/* Back — answer form */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip interaction */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction */}
        <div
          className="absolute inset-0 bg-white rounded-2xl px-6 pt-5 pb-6 shadow-sm border border-[#E8F8FF] flex flex-col cursor-pointer overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          onClick={() => setIsFlipped(false)}
        >
          <div className="flex items-start gap-2 shrink-0">
            <p className="text-sm text-primary-darker line-clamp-2 leading-relaxed flex-1">
              {prompt}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onSwitch(questionId); }}
              className="shrink-0 -mt-0.5 -mr-1 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-text-dark/30 hover:text-text-dark/55 hover:bg-black/5 h-auto transition-colors"
            >
              <RefreshCw className="size-3" />
              {t("switchQuestion")}
            </Button>
          </div>

          {isChoice ? (
            <>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for option grid */}
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation for option grid */}
              <div
                className="flex-1 grid grid-cols-2 gap-2 mt-4 min-w-0"
                onClick={(e) => e.stopPropagation()}
              >
                {options.map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setSelected(opt); }}
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
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation for textarea area */}
              <div
                className="flex-1 flex items-center min-h-0"
                onClick={(e) => e.stopPropagation()}
              >
                <textarea
                  rows={1}
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
            onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
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

      {questions[0] && (
        <CarouselQuestionCard
          key={questions[0].id}
          questionId={questions[0].id}
          prompt={questions[0].prompt}
          questionType={questions[0].questionType}
          options={questions[0].options}
          onAnswered={handleAnswered}
          onSwitch={handleSwitch}
        />
      )}
    </div>
  );
}
