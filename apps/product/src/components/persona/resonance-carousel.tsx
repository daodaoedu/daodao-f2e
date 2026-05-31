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
import { CheckCircle2, Laugh, Lock, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CarouselQuestion = {
  id: number;
  prompt: string;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  isNewUserPriority: boolean;
};

// ── Drag-scroll hook ──────────────────────────────────────────────────────────

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const hasDragged = useRef(false);
  const suppressNextClick = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    dragging.current = true;
    hasDragged.current = false;
    suppressNextClick.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  };
  const stop = () => {
    if (hasDragged.current) {
      suppressNextClick.current = true;
    }
    dragging.current = false;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    if (Math.abs(x - startX.current) > 5) {
      hasDragged.current = true;
    }
    ref.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (!suppressNextClick.current) return;
    suppressNextClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return { ref, onClickCapture, onMouseDown, onMouseUp: stop, onMouseLeave: stop, onMouseMove };
}

// ── Locked response card (community preview placeholder) ──────────────────────

function LockedResponseCard({ onUnlock }: { onUnlock: () => void }) {
  const t = useTranslations("persona.carousel");
  return (
    <div className="flex-shrink-0 w-[160px] h-[136px] rounded-xl border border-[#EEF4F4] bg-white p-3 relative overflow-hidden flex flex-col">
      {/* Blurred placeholder content */}
      <div className="blur-sm select-none pointer-events-none flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2 shrink-0">
          <div className="size-6 rounded-full bg-logo-cyan/30 shrink-0" />
          <div className="h-2.5 bg-text-dark/15 rounded-full w-14" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 bg-text-dark/10 rounded-full w-full" />
          <div className="h-2 bg-text-dark/10 rounded-full w-4/5" />
          <div className="h-2 bg-text-dark/10 rounded-full w-full" />
          <div className="h-2 bg-text-dark/10 rounded-full w-3/5" />
        </div>
      </div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: lock card unlock interaction */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: lock card unlock interaction */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onUnlock();
        }}
      >
        <Lock className="size-4 text-logo-cyan" />
        <span className="text-[11px] text-text-dark/55 border border-[#D8ECEC] rounded-full px-3 py-1 bg-white whitespace-nowrap text-center leading-tight">
          {t("unlockHint")}
        </span>
      </div>
    </div>
  );
}

// ── Carousel question card ────────────────────────────────────────────────────

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
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [extraMinHeight, setExtraMinHeight] = useState(0);
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const dragScroll = useDragScroll();

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
      setSubmittedAnswer(isChoice ? selected : textValue.trim());
      setSelected("");
      setTextValue("");
      setSubmitted(true);
    } catch {
      toast.error(tProfile("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToProfile = () => {
    onAnswered();
    const identifier = currentUser?.data?.customId ?? currentUser?.data?.id;
    if (identifier) router.push(`/users/${identifier}`);
  };

  // Feature B: already-answered card — shows the actual answer + CTA
  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 px-5 pt-4 pb-5 flex flex-col gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-logo-cyan bg-logo-cyan/10 rounded-full px-2.5 py-1 self-start">
          <CheckCircle2 className="size-3" />
          {t("answered")}
        </span>
        <p className="text-sm text-text-dark/60 leading-relaxed line-clamp-2">{prompt}</p>
        {submittedAnswer && (
          <p className="text-base font-medium text-text-dark line-clamp-4">{submittedAnswer}</p>
        )}
        <button
          type="button"
          onClick={navigateToProfile}
          className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary-darker hover:opacity-80 transition-opacity self-start"
        >
          {t("submitted.cta")}
          <ArrowCircleSvg className="size-6 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div style={{ perspective: "1000px" }} className="w-full">
      <div
        className="relative w-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — question + community preview (normal flow, sets card height) */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction, contains interactive children */}
        <div
          className="group w-full bg-white rounded-2xl px-5 pt-5 pb-5 shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 flex flex-col cursor-pointer select-none"
          style={{ backfaceVisibility: "hidden", minHeight: extraMinHeight || undefined }}
          onClick={() => setIsFlipped(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsFlipped(true);
          }}
        >
          <QuoteFillSvg className="mt-2 mb-3 self-center shrink-0 text-logo-cyan" />
          <p className="text-[22px] font-semibold text-text-dark text-center leading-snug shrink-0">
            {prompt}
          </p>

          {/* Community responses header */}
          <div className="mt-5 mb-2 flex items-center gap-1.5 shrink-0">
            <span className="text-sm font-medium text-text-dark/65">{t("communityLabel")}</span>
          </div>

          {/* Horizontal scroll of locked placeholder cards */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for scroll area */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation for scroll area */}
          <div
            ref={dragScroll.ref}
            className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-1 shrink-0 cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
            onClickCapture={dragScroll.onClickCapture}
            onMouseDown={dragScroll.onMouseDown}
            onMouseUp={dragScroll.onMouseUp}
            onMouseLeave={dragScroll.onMouseLeave}
            onMouseMove={dragScroll.onMouseMove}
          >
            {[0, 1, 2].map((i) => (
              <LockedResponseCard key={i} onUnlock={() => setIsFlipped(true)} />
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-9 flex items-center justify-end shrink-0">
            <div className="flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-1">
              <span className="text-sm font-medium text-primary-darker">{frontLabel}</span>
              <ArrowCircleSvg className="size-8 shrink-0" />
            </div>
          </div>
        </div>

        {/* Back — answer form (absolute, fills front face height) */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip interaction, contains interactive children */}
        <div
          className="absolute inset-0 bg-white rounded-2xl px-6 pt-5 pb-6 shadow-sm border border-[#E8F8FF] flex flex-col cursor-pointer overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          onClick={() => setIsFlipped(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsFlipped(false);
          }}
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
            // biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for option grid
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
          ) : (
            // biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for textarea area
            <div
              className="flex-1 flex items-center min-h-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <textarea
                rows={2}
                value={textValue}
                onChange={(e) => {
                  setTextValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  const needed = e.target.scrollHeight + 200;
                  if (needed > 380) setExtraMinHeight(needed);
                }}
                placeholder={tProfile("textPlaceholder")}
                maxLength={300}
                className="w-full border-0 border-b-2 border-logo-cyan text-base text-text-dark outline-none bg-transparent placeholder:text-text-dark/25 pb-1 resize-none"
              />
            </div>
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

// ── Carousel container ────────────────────────────────────────────────────────

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

  if (displayedQuestions.length === 0 && isLoading) return null;
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
