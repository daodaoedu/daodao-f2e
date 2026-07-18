"use client";

import {
  getPersonaQuestionAnswers,
  type PersonaQuestionAnswerItem,
  submitPersonaAnswer,
  useMutate,
  usePersonaCarouselState,
} from "@daodao/api";
import { QuoteFillSvg } from "@daodao/assets";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@daodao/ui/components/carousel";
import { InputGroup, InputGroupTextarea } from "@daodao/ui/components/input-group";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Laugh, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { getAvatarColor } from "./avatar-colors";

// ── Loading placeholder ───────────────────────────────────────────────────────

function ResponseSkeletonCard() {
  return (
    <div className="h-full min-h-[112px] rounded-[14px] border border-[#EEF4F4] bg-[#FAFDFD] p-3">
      <div className="animate-pulse select-none">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-7 rounded-full bg-logo-cyan/15 shrink-0" />
          <div className="h-2.5 bg-text-dark/15 rounded-full w-14" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 bg-text-dark/10 rounded-full w-full" />
          <div className="h-2 bg-text-dark/10 rounded-full w-4/5" />
        </div>
        <div className="mt-3 h-2 bg-logo-cyan/10 rounded-full w-24" />
      </div>
    </div>
  );
}

// ── Preview response card (real answer teaser, truncated with fade) ───────────

function PreviewResponseCard({ answer }: { readonly answer: PersonaQuestionAnswerItem }) {
  const t = useTranslations("persona.carousel");
  const text = answer.selectedValue ?? answer.textAnswer ?? "";
  const displayName = answer.name ?? "??";
  const initial = displayName[0] ?? "?";
  const avatarColor = getAvatarColor(displayName);

  return (
    <div className="h-full rounded-[14px] border border-[#EEF4F4] bg-[#FAFDFD] p-3 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <Avatar className="size-7">
          {answer.photoURL && (
            <AvatarImage src={answer.photoURL} alt={displayName} className="object-cover" />
          )}
          <AvatarFallback
            className="text-xs font-bold text-white"
            style={{ background: avatarColor }}
          >
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-semibold text-text-dark truncate">{displayName}</span>
      </div>
      <div className="relative">
        <p className="text-[13px] text-text-dark/70 leading-relaxed line-clamp-2">{text}</p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-b from-transparent to-[#FAFDFD]" />
      </div>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-primary-darker leading-tight">
        <Lock className="size-3 shrink-0" />
        <span>{t("previewUnlockHint")}</span>
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
  loadPreviews: boolean;
  onAnswered: () => void;
}

function CarouselQuestionCard({
  questionId,
  prompt,
  questionType,
  options,
  loadPreviews,
  onAnswered,
}: CarouselQuestionCardProps) {
  const t = useTranslations("persona.carousel");
  const tProfile = useTranslations("persona.myProfile");
  const tDetail = useTranslations("persona.detail");
  const locale = useLocale();
  const [selected, setSelected] = useState("");
  const [textValue, setTextValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<PersonaQuestionAnswerItem[]>([]);
  const [totalAnswerCount, setTotalAnswerCount] = useState(0);
  const [previewsLoaded, setPreviewsLoaded] = useState(false);
  const router = useRouter();

  // Load a few real answers as teaser previews for the community row.
  useEffect(() => {
    if (!loadPreviews) {
      setPreviewAnswers([]);
      setTotalAnswerCount(0);
      setPreviewsLoaded(false);
      return;
    }

    let cancelled = false;
    const fetchPreviews = async () => {
      try {
        const res = await getPersonaQuestionAnswers(questionId, { locale, limit: 3 });
        if (cancelled) return;
        if (res.error) {
          console.error("Failed to load persona answer previews");
          setPreviewsLoaded(true);
          return;
        }
        const data = res.data?.data;
        if (data) {
          // Prefer free-text answers for previews — option-only answers make dull teasers.
          const sorted = [...(data.answers ?? [])].sort(
            (a, b) => Number(Boolean(b.textAnswer)) - Number(Boolean(a.textAnswer))
          );
          setPreviewAnswers(sorted);
          setTotalAnswerCount(data.question?.totalAnswerCount ?? 0);
        }
        setPreviewsLoaded(true);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load persona answer previews", error);
          setPreviewsLoaded(true);
        }
      }
    };
    setPreviewAnswers([]);
    setTotalAnswerCount(0);
    setPreviewsLoaded(false);
    fetchPreviews();
    return () => {
      cancelled = true;
    };
  }, [questionId, locale, loadPreviews]);

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
      router.push(`/persona/${questionId}`);
    } catch {
      toast.error(tProfile("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const hasValidAnswer = isChoice ? Boolean(selected) : Boolean(textValue.trim());

  return (
    <div className="relative h-[520px] sm:h-[480px] w-full overflow-y-auto overscroll-contain bg-white rounded-[20px] px-5 pb-5 pt-6 sm:px-7 shadow-sm flex flex-col">
      <QuoteFillSvg className="mb-2 mx-auto text-logo-cyan" />
      <p className="text-[22px] sm:text-2xl font-semibold text-text-dark text-center leading-snug">
        {prompt}
      </p>

      <div className="mt-4 mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="size-[7px] rounded-full bg-logo-cyan animate-pulse shrink-0" />
          <span className="text-sm font-medium text-text-dark/65">{t("communityLabel")}</span>
        </div>
        {totalAnswerCount > 0 && (
          <span className="text-xs text-text-dark/35 shrink-0">
            {tDetail("answeredCount", { count: totalAnswerCount })}
          </span>
        )}
      </div>

      <div className="grid grid-flow-col auto-cols-[82%] gap-3 overflow-x-auto pb-1 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:overflow-visible">
        {previewAnswers.slice(0, 3).map((answer) => (
          <PreviewResponseCard key={answer.answerId} answer={answer} />
        ))}
        {previewAnswers.length === 0 &&
          !previewsLoaded &&
          [0, 1, 2].map((i) => <ResponseSkeletonCard key={i} />)}
        {previewAnswers.length === 0 && previewsLoaded && (
          <div className="col-span-full h-full min-h-[112px] rounded-[14px] border border-[#EEF4F4] bg-[#FAFDFD] p-3 flex items-center justify-center">
            <span className="text-xs text-text-dark/40">{tDetail("emptyResponses")}</span>
          </div>
        )}
      </div>

      {isChoice ? (
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap gap-2">
            {(options ?? []).map((opt) => (
              <Button
                key={opt}
                type="button"
                variant="ghost"
                animation="none"
                onClick={() => setSelected(opt)}
                className={cn(
                  "w-auto max-w-full whitespace-normal rounded-full border text-sm py-2 px-4 h-auto transition-all leading-snug",
                  selected === opt
                    ? "border-logo-cyan bg-logo-cyan/10 text-primary-darker font-medium hover:bg-logo-cyan/10 hover:text-primary-darker"
                    : "border-dashed border-logo-cyan/40 text-primary-darker hover:border-logo-cyan hover:bg-logo-cyan/[0.06]"
                )}
              >
                {opt}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              animation="none"
              onClick={handleSubmit}
              disabled={submitting || !hasValidAnswer}
              className={cn(
                "h-auto rounded-full px-6 py-2.5 text-sm font-medium transition-all",
                !submitting && hasValidAnswer
                  ? "bg-[#F5A93E] text-white hover:bg-[#F5A93E]/90"
                  : "bg-[#F5A93E]/30 text-white/70 cursor-not-allowed"
              )}
            >
              {submitting ? tProfile("submitting") : tProfile("submit")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <InputGroup className="h-auto min-h-14 rounded-2xl border-2 border-logo-cyan/30 bg-[#FBFEFE] px-2 py-2 focus-within:border-logo-cyan focus-within:ring-0">
            <InputGroupTextarea
              rows={1}
              value={textValue}
              onChange={(e) => {
                setTextValue(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder={tProfile("textPlaceholder")}
              maxLength={300}
              className="max-h-[120px] min-h-0 py-2 text-left leading-5 text-text-dark placeholder:text-left placeholder:text-text-dark/35"
            />
            <Button
              type="button"
              animation="none"
              onClick={handleSubmit}
              disabled={submitting || !hasValidAnswer}
              className={cn(
                "shrink-0 h-auto rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                !submitting && hasValidAnswer
                  ? "bg-[#F5A93E] text-white hover:bg-[#F5A93E]/90"
                  : "bg-[#F5A93E]/30 text-white/70 cursor-not-allowed"
              )}
            >
              {submitting ? tProfile("submitting") : tProfile("submit")}
            </Button>
          </InputGroup>
          <p className="mt-3 text-center text-xs leading-relaxed text-text-dark/40">
            {t("quickStartHint")}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Carousel container ────────────────────────────────────────────────────────

export function ResonanceCarousel() {
  const t = useTranslations("persona.carousel");
  const locale = useLocale();
  const mutate = useMutate();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data, isLoading } = usePersonaCarouselState(undefined, locale);
  const displayedQuestions = data?.data?.questions ?? [];
  const shouldShow = data?.data?.shouldShow;

  useEffect(() => {
    if (!carouselApi) return;

    const updateSelectedIndex = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
    };

    updateSelectedIndex();
    carouselApi.on("select", updateSelectedIndex);
    carouselApi.on("reInit", updateSelectedIndex);

    return () => {
      carouselApi.off("select", updateSelectedIndex);
      carouselApi.off("reInit", updateSelectedIndex);
    };
  }, [carouselApi]);

  if (isLoading) return null;
  if (shouldShow === false) return null;
  if (displayedQuestions.length === 0) return null;

  const handleAnswered = async () => {
    await mutate(["/api/v1/persona/carousel-state"] as const);
  };

  const previewSlideIndexes = new Set<number>([selectedIndex]);
  const lastQuestionIndex = displayedQuestions.length - 1;
  if (displayedQuestions.length > 1) {
    previewSlideIndexes.add(selectedIndex === 0 ? lastQuestionIndex : selectedIndex - 1);
    previewSlideIndexes.add(selectedIndex === lastQuestionIndex ? 0 : selectedIndex + 1);
  }

  return (
    <div className="mb-4">
      <Carousel
        setApi={setCarouselApi}
        opts={{ align: "start", loop: true }}
        aria-label={t("title")}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-text-dark/60">
            <Laugh className="size-3.5 shrink-0" />
            <span>{t("title")}</span>
          </div>
          {displayedQuestions.length > 1 && (
            <div className="flex items-center gap-2">
              <CarouselPrevious className="static size-9 translate-y-0 border border-[#E4EAE9] bg-white text-text-dark/55 hover:bg-logo-cyan/[0.06] hover:text-logo-cyan" />
              <span className="min-w-10 text-center text-xs font-medium text-text-dark/45">
                {selectedIndex + 1}/{displayedQuestions.length}
              </span>
              <CarouselNext className="static size-9 translate-y-0 border border-[#E4EAE9] bg-white text-text-dark/55 hover:bg-logo-cyan/[0.06] hover:text-logo-cyan" />
            </div>
          )}
        </div>

        <CarouselContent className="-ml-0 items-stretch">
          {displayedQuestions.map((q, index) => (
            <CarouselItem
              key={q.id}
              className="flex self-stretch items-stretch py-0.5 pr-0.5 pl-0.5"
            >
              <CarouselQuestionCard
                questionId={q.id}
                prompt={q.prompt}
                questionType={q.questionType}
                options={q.options}
                loadPreviews={previewSlideIndexes.has(index)}
                onAnswered={handleAnswered}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
