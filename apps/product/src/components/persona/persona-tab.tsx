"use client";

import { usePersonaProfileMe, usePersonaQuestions } from "@daodao/api";
import { ArrowCircleSvg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Lock } from "lucide-react";

// ── Mini locked placeholder card ──────────────────────────────────────────────

function MiniLockedCard({ onUnlock }: { onUnlock: () => void }) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: lock card
    // biome-ignore lint/a11y/noStaticElementInteractions: lock card
    <div
      className="rounded-xl bg-[#F5F9F9] p-2.5 flex flex-col gap-1.5 relative overflow-hidden cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onUnlock();
      }}
    >
      <div className="blur-sm select-none pointer-events-none">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="size-5 rounded-full bg-text-dark/15 shrink-0" />
          <div className="h-2 bg-text-dark/15 rounded-full w-12" />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-text-dark/10 rounded-full w-full" />
          <div className="h-1.5 bg-text-dark/10 rounded-full w-4/5" />
          <div className="h-1.5 bg-text-dark/10 rounded-full w-3/5" />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Lock className="size-3.5 text-logo-cyan/60" />
      </div>
    </div>
  );
}

// ── Mini card showing user's own answer ───────────────────────────────────────

function MiniMyAnswerCard({ answerText }: { answerText: string }) {
  const t = useTranslations("persona.myProfile");
  return (
    <div className="rounded-xl bg-logo-cyan/[0.08] p-2.5 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <div className="size-5 rounded-full bg-logo-cyan flex items-center justify-center text-white text-[9px] font-bold shrink-0">
          我
        </div>
        <span className="text-xs font-medium text-logo-cyan truncate">{t("myAnswerLabel")}</span>
      </div>
      <p className="text-[11px] text-text-dark/55 line-clamp-3 leading-relaxed">{answerText}</p>
    </div>
  );
}

// ── Full-width question card matching mockup layout ───────────────────────────

interface PersonaQuestionCardProps {
  id: number;
  prompt: string;
  answer: {
    selectedValue: string | null;
    textAnswer: string | null;
    resonanceCount: number;
  } | null;
}

function PersonaQuestionCard({ id, prompt, answer }: PersonaQuestionCardProps) {
  const t = useTranslations("persona.myProfile");
  const router = useRouter();
  const isAnswered = answer !== null;
  const answerText = answer?.selectedValue ?? answer?.textAnswer ?? "";

  const handleNavigate = () => router.push(`/persona/${id}`);

  return (
    <button
      type="button"
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={handleNavigate}
    >
      {/* Top row: question + arrow */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-dark leading-snug">{prompt}</p>
          <div className="mt-1.5 flex items-center gap-2">
            {isAnswered ? (
              <span className="text-xs text-logo-cyan font-medium">{t("answeredLabel")}</span>
            ) : (
              <span className="text-xs text-text-dark/35">{t("unansweredLabel")}</span>
            )}
            {isAnswered && (answer?.resonanceCount ?? 0) > 0 && (
              <span className="text-xs text-text-dark/35">· ✦ {answer?.resonanceCount}</span>
            )}
          </div>
        </div>
        <ArrowCircleSvg className="size-8 shrink-0 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Bottom section */}
      {isAnswered ? (
        <div className="grid grid-cols-2 gap-1.5 px-4 pb-4">
          <MiniMyAnswerCard answerText={answerText} />
          <MiniLockedCard onUnlock={handleNavigate} />
          <MiniLockedCard onUnlock={handleNavigate} />
          <MiniLockedCard onUnlock={handleNavigate} />
        </div>
      ) : (
        <div className="mx-4 mb-4 rounded-xl bg-[#F5F9F9] py-4 flex items-center justify-center">
          <span className="text-xs text-text-dark/35">{t("unansweredHint")}</span>
        </div>
      )}
    </button>
  );
}

// ── PersonaTab ────────────────────────────────────────────────────────────────

export function PersonaTab() {
  const t = useTranslations("persona");
  const locale = useLocale();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: profileData, isLoading: isProfileLoading } = usePersonaProfileMe(locale, {
    enabled: isAuthenticated,
  });
  const { data: questionsData, isLoading: isQuestionsLoading } = usePersonaQuestions(locale, {
    enabled: !isAuthenticated,
  });

  const isLoading = isAuthLoading || (isAuthenticated ? isProfileLoading : isQuestionsLoading);

  const questions = isAuthenticated
    ? (profileData?.data?.questions ?? []).map((q) => ({
        id: q.id,
        prompt: q.prompt,
        answer: q.isPlaceholder ? null : q.answer,
      }))
    : (questionsData?.data?.questions ?? []).map((q) => ({
        id: q.id,
        prompt: q.prompt,
        answer: null as null,
      }));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 mt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl h-[160px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="py-8 text-center text-text-dark/40 text-sm">{t("myProfile.empty")}</div>;
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Header */}
      <div className="px-1 h-20 flex flex-col justify-center text-center">
        <p className="text-base font-bold text-text-dark leading-snug">{t("tab.headerTitle")}</p>
        <p className="text-xs text-text-dark/45 mt-1">{t("tab.headerSubtitle")}</p>
      </div>

      {questions.map((q) => (
        <PersonaQuestionCard key={q.id} id={q.id} prompt={q.prompt} answer={q.answer} />
      ))}
    </div>
  );
}
