"use client";

import {
  type PersonaQuestionAnswerItem,
  usePersonaProfileMe,
  usePersonaQuestionAnswers,
  usePersonaQuestions,
} from "@daodao/api";
import { QuoteFillSvg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { MessageCircle, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { getAvatarColor } from "./avatar-colors";

type PersonaAnswerType = {
  selectedValue: string | null;
  textAnswer: string | null;
  resonanceCount: number;
} | null;

type PersonaStoryCardProps = {
  answer: PersonaAnswerType;
  id: number;
  index: number;
  isLast: boolean;
  prompt: string;
};

function getFeaturedStory(answers: PersonaQuestionAnswerItem[]) {
  return [...answers]
    .filter((answer) => !answer.isSelf)
    .sort((first, second) => {
      const textAnswerDifference =
        Number(Boolean(second.textAnswer)) - Number(Boolean(first.textAnswer));
      if (textAnswerDifference !== 0) return textAnswerDifference;
      return second.resonanceCount - first.resonanceCount;
    })[0];
}

function StoryLoadingCard({ isLast }: { isLast: boolean }) {
  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
      <div className="flex flex-col items-center">
        <div className="mt-7 size-3 rounded-full bg-logo-cyan/25" />
        {!isLast && <div className="w-px flex-1 bg-logo-cyan/15" />}
      </div>
      <div className="min-h-[320px] rounded-3xl bg-white p-5 shadow-sm animate-pulse">
        <div className="h-3 w-20 rounded-full bg-logo-cyan/10" />
        <div className="mt-6 h-4 w-4/5 rounded-full bg-text-dark/10" />
        <div className="mt-12 flex items-center gap-3">
          <div className="size-11 rounded-full bg-text-dark/10" />
          <div className="h-3 w-24 rounded-full bg-text-dark/10" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 rounded-full bg-text-dark/10" />
          <div className="h-4 w-5/6 rounded-full bg-text-dark/10" />
          <div className="h-4 w-2/3 rounded-full bg-text-dark/10" />
        </div>
      </div>
    </div>
  );
}

function StoryAvatar({
  avatarColor,
  displayName,
  photoURL,
}: {
  avatarColor: string;
  displayName: string;
  photoURL: string | null | undefined;
}) {
  const initial = displayName[0] ?? "?";

  return (
    <Avatar className="size-11">
      {photoURL && <AvatarImage src={photoURL} alt={displayName} className="object-cover" />}
      <AvatarFallback className="text-sm font-bold text-white" style={{ background: avatarColor }}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

function PersonaStoryCard({ answer, id, index, isLast, prompt }: PersonaStoryCardProps) {
  const t = useTranslations("persona.tab");
  const tDetail = useTranslations("persona.detail");
  const locale = useLocale();
  const router = useRouter();
  const isAnswered = answer !== null;

  const { data, isLoading, error } = usePersonaQuestionAnswers(id, {
    locale,
    limit: 3,
  });

  const hasError = Boolean(error);
  const answers = data?.data?.answers ?? [];
  const featuredStory = useMemo(() => getFeaturedStory(answers), [answers]);
  const totalAnswerCount = data?.data?.question?.totalAnswerCount ?? 0;

  if (isLoading) return <StoryLoadingCard isLast={isLast} />;

  const storyText = featuredStory?.textAnswer || featuredStory?.selectedValue || "";
  const displayName = featuredStory?.name ?? t("anonymous");
  const avatarColor = getAvatarColor(displayName);
  const remainingStoryCount = Math.max(0, totalAnswerCount - 1);

  const handleNavigate = () => {
    router.push(`/persona/${id}`);
  };

  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
      <div className="flex flex-col items-center" aria-hidden="true">
        <div className="mt-7 size-3 rounded-full border-[3px] border-white bg-logo-cyan shadow-sm ring-2 ring-logo-cyan/15" />
        {!isLast && <div className="w-px flex-1 bg-logo-cyan/20" />}
      </div>

      <article className="group relative mb-3 min-h-[320px] overflow-hidden rounded-3xl border border-[#E4EAE9] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-logo-cyan">
            {t("storyNumber", { number: index + 1 })}
          </span>
          {totalAnswerCount > 0 && (
            <span className="text-xs text-text-dark/40">
              {tDetail("answeredCount", { count: totalAnswerCount })}
            </span>
          )}
        </div>

        <div className="mt-5 border-l-2 border-logo-cyan/25 pl-4">
          <p className="text-sm font-medium leading-relaxed text-text-dark/55 text-pretty">
            {prompt}
          </p>
        </div>

        {featuredStory && storyText ? (
          <div className="mt-5">
            <div className="flex items-center gap-3">
              <StoryAvatar
                avatarColor={avatarColor}
                displayName={displayName}
                photoURL={featuredStory.photoURL}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-dark">{displayName}</p>
                {featuredStory.resonanceCount > 0 && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-text-dark/40">
                    <Sparkles className="size-3 text-logo-orange" />
                    {t("resonanceCount", { count: featuredStory.resonanceCount })}
                  </p>
                )}
              </div>
            </div>

            <div className="relative mt-4">
              <QuoteFillSvg className="mb-2 size-8 text-logo-cyan/70" />
              <blockquote className="text-base font-medium leading-relaxed text-text-dark text-pretty sm:text-lg">
                {storyText}
              </blockquote>
            </div>
          </div>
        ) : (
          <div className="mt-9 flex min-h-[150px] flex-col items-center justify-center rounded-2xl bg-[#F5F9F9] px-6 text-center">
            <MessageCircle className="size-6 text-logo-cyan/60" />
            <p className="mt-3 text-sm leading-relaxed text-text-dark/55 text-pretty">
              {hasError ? tDetail("loadError") : t("emptyStory")}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-[#E4EAE9] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-dark/40">
            {remainingStoryCount > 0
              ? t("moreStories", { count: remainingStoryCount })
              : t("startConversation")}
          </p>
          <Button
            type="button"
            onClick={handleNavigate}
            animation="none"
            className="h-auto w-full rounded-full bg-logo-cyan px-5 py-2.5 text-sm font-medium text-white hover:bg-logo-cyan/90 sm:w-auto"
          >
            {isAnswered ? t("readAndRespond") : t("shareMine")}
          </Button>
        </div>
      </article>
    </div>
  );
}

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
    ? (profileData?.data?.questions ?? []).map((question) => ({
        id: question.id,
        prompt: question.prompt,
        answer: question.isPlaceholder ? null : question.answer,
      }))
    : (questionsData?.data?.questions ?? []).map((question) => ({
        id: question.id,
        prompt: question.prompt,
        answer: null as null,
      }));

  if (isLoading) {
    return (
      <div className="mt-6 flex flex-col">
        {[0, 1, 2].map((index) => (
          <StoryLoadingCard key={index} isLast={index === 2} />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="py-8 text-center text-sm text-text-dark/40">{t("myProfile.empty")}</div>;
  }

  return (
    <div className="mt-2">
      <header className="px-3 pb-7 pt-4">
        <p className="text-xs font-medium text-logo-cyan">{t("tab.eyebrow")}</p>
        <h1 className="mt-2 text-xl font-bold leading-snug text-text-dark text-balance sm:text-2xl">
          {t("tab.headerTitle")}
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-dark/50 text-pretty">
          {t("tab.headerSubtitle")}
        </p>
      </header>

      <div className="flex flex-col">
        {questions.map((question, index) => (
          <PersonaStoryCard
            key={question.id}
            id={question.id}
            index={index}
            prompt={question.prompt}
            answer={question.answer}
            isLast={index === questions.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
