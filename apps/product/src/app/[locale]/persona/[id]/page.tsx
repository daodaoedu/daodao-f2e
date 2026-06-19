"use client";

import {
  createComment,
  deleteComment,
  getPersonaQuestionAnswers,
  type PersonaQuestionAnswerItem,
  type ReactionTypeValue,
  removeReaction,
  submitPersonaAnswer,
  updateComment,
  upsertReaction,
  useComments,
  useCurrentUser,
  useMentionCandidates,
  useReactions,
} from "@daodao/api";
import { DialogOutlineSvg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import type { MentionCandidate } from "@daodao/features-mention";
import { useLocale, useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircle2, ChevronDown, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  getDateFnsLocale,
  isApiCommentNode,
  mapComment,
} from "@/components/check-in/display/check-in-detail";
import { CommentSection, ReactionPickerButton } from "@/components/check-in/reactions";
import type { IComment } from "@/components/check-in/reactions/comment-section";
import { BackgroundAnimation } from "@/components/layout";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { OTHER_OPTION_VALUE } from "@/components/persona/other-option-utils";

function QuoteSvg({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>引言符號</title>
      <path
        d="M51.4667 16.8C54.1333 19.7334 55.7333 22.9334 55.7333 28.2667C55.7333 37.6 49.0667 45.8667 39.7333 50.1334L37.3333 46.6667C46.1333 41.8667 48 35.7334 48.5333 31.7334C47.2 32.5334 45.3333 32.8 43.4667 32.5334C38.6667 32 34.9333 28.2667 34.9333 23.2C34.9333 20.8 36 18.4 37.6 16.5334C39.4667 14.6667 41.6 13.8667 44.2667 13.8667C47.2 13.8667 49.8667 15.2 51.4667 16.8ZM24.8 16.8C27.4667 19.7334 29.0667 22.9334 29.0667 28.2667C29.0667 37.6 22.4 45.8667 13.0667 50.1334L10.6667 46.6667C19.4667 41.8667 21.3333 35.7334 21.8667 31.7334C20.5333 32.5334 18.6667 32.8 16.8 32.5334C12 32 8.26666 28 8.26666 23.2C8.26666 20.8 9.33333 18.4 10.9333 16.5334C12.8 14.6667 14.9333 13.8667 17.6 13.8667C20.5333 13.8667 23.2 15.2 24.8 16.8Z"
        fill="#16B9B3"
      />
    </svg>
  );
}

// ─── Inline flip card ─────────────────────────────────────────────────────────

function InlineFlipCard({
  prompt,
  questionType,
  options,
  flipped,
  onFlippedChange,
  onSubmit,
}: {
  prompt: string;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  flipped: boolean;
  onFlippedChange: (v: boolean) => void;
  onSubmit: (answer: string, isChoice: boolean) => void;
}) {
  const t = useTranslations("persona.detail");
  const tProfile = useTranslations("persona.myProfile");
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState("");
  const [otherText, setOtherText] = useState("");

  const isChoice = questionType === "choice" && options && options.length > 0;
  const isOtherSelected = isChoice && selected === OTHER_OPTION_VALUE;

  return (
    <div style={{ perspective: "1000px" }} className="w-full mb-4">
      <div
        className="grid w-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip */}
        <div
          className="group w-full bg-white rounded-2xl px-5 pt-5 pb-5 shadow-sm hover:shadow-md hover:ring-2 hover:ring-logo-cyan transition-all duration-200 flex flex-col cursor-pointer select-none [grid-area:1/1]"
          style={{ backfaceVisibility: "hidden" }}
          onClick={() => onFlippedChange(true)}
        >
          <QuoteSvg className="mt-1 mb-3 self-center shrink-0" />
          <p className="text-[20px] font-semibold text-text-dark text-center leading-snug shrink-0">
            {prompt}
          </p>
          <div className="mt-8 flex items-center justify-end shrink-0">
            <div className="flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-1">
              <span className="text-sm font-medium text-primary-darker">{t("shareThoughts")}</span>
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-8 shrink-0"
              >
                <title>繼續箭頭</title>
                <circle cx="30" cy="30" r="30" fill="#F0FAFA" />
                <path
                  d="M42.0735 30.0176L30.4666 30.0194M30.45 30.0194L17.85 30.0194M30.45 17.4L41.3791 28.3296C41.8221 28.7727 42.071 29.3735 42.071 30C42.071 30.6265 41.8221 31.2274 41.3791 31.6704L30.45 42.6"
                  stroke="#5C7080"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Back */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: card flip */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: card flip */}
        <div
          className="bg-white rounded-2xl px-6 pt-5 pb-6 shadow-sm border border-[#E8F8FF] flex flex-col cursor-pointer [grid-area:1/1]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          onClick={() => onFlippedChange(false)}
        >
          <p className="text-sm text-primary-darker leading-relaxed shrink-0 line-clamp-2">
            {prompt}
          </p>
          {isChoice ? (
            // biome-ignore lint/a11y/noStaticElementInteractions: stop propagation
            // biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation
            <div
              className="flex-1 flex flex-col gap-2 mt-4 min-h-[80px]"
              onClick={(e) => e.stopPropagation()}
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelected(opt);
                    if (opt !== OTHER_OPTION_VALUE) setOtherText("");
                  }}
                  className={cn(
                    "w-full text-left rounded-xl border-2 text-sm py-3 px-4 transition-all leading-snug",
                    selected === opt
                      ? "border-logo-cyan bg-logo-cyan/10 text-logo-cyan font-medium"
                      : "border-[#E8F8FF] text-text-dark/65 hover:border-logo-cyan/40"
                  )}
                >
                  {opt}
                </button>
              ))}
              {isOtherSelected && (
                // biome-ignore lint/a11y/noStaticElementInteractions: stop propagation
                // biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation
                <textarea
                  rows={2}
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder={t("thoughtPlaceholder")}
                  className="w-full border-2 border-logo-cyan rounded-xl text-sm text-text-dark outline-none bg-transparent placeholder:text-text-dark/25 p-3 resize-none"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          ) : (
            // biome-ignore lint/a11y/noStaticElementInteractions: stop propagation
            // biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation
            <div
              className="flex-1 flex items-center min-h-[80px]"
              onClick={(e) => e.stopPropagation()}
            >
              <textarea
                rows={1}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder={t("thoughtPlaceholder")}
                className="w-full border-0 border-b-2 border-logo-cyan text-base text-text-dark outline-none bg-transparent placeholder:text-text-dark/25 pb-1 resize-none overflow-hidden"
              />
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isChoice && selected) {
                if (isOtherSelected && otherText.trim()) {
                  onSubmit(otherText.trim(), false);
                } else if (!isOtherSelected) {
                  onSubmit(selected, true);
                }
              } else if (!isChoice && answer.trim()) {
                onSubmit(answer.trim(), false);
              }
            }}
            disabled={
              isChoice
                ? !selected || (isOtherSelected && !otherText.trim())
                : !answer.trim()
            }
            className={cn(
              "shrink-0 w-full py-3 rounded-full font-medium text-base transition-all mt-4",
              (isChoice ? (isOtherSelected ? otherText.trim() : selected) : answer.trim())
                ? "bg-[#F5A93E] text-white"
                : "bg-[#F5A93E]/30 text-white/70 cursor-not-allowed"
            )}
          >
            {tProfile("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Persona answer interactions ──────────────────────────────────────────────

// ─── Sheet content for persona answer comments ────────────────────────────────

function PersonaAnswerCommentSheetContent({ answerId }: { answerId: number }) {
  const t = useTranslations("persona.detail");
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.data as
    | { id?: string; name?: string; photoURL?: string; photoUrl?: string }
    | undefined;
  const locale = useLocale();
  const dateFnsLocale = useMemo(() => getDateFnsLocale(locale), [locale]);
  const targetId = String(answerId);

  const { data: commentsData, mutate: mutateComments } = useComments({
    targetType: "persona_answer",
    targetId,
  });
  const { data: mentionCandidatesData } = useMentionCandidates({
    targetType: "persona_answer",
    targetId,
  });

  const comments: IComment[] = useMemo(() => {
    const raw = commentsData?.data;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isApiCommentNode).map((c) =>
      mapComment(c, {
        anonymousLabel: t("anonymousUser"),
        justNowLabel: t("justNow"),
        locale: dateFnsLocale,
      })
    );
  }, [commentsData, dateFnsLocale, t]);

  const mentionCandidates = useMemo<MentionCandidate[]>(() => {
    const raw = (mentionCandidatesData as { data?: unknown[] } | undefined)?.data;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (c): c is MentionCandidate & { numericUserId: number } =>
          typeof c === "object" &&
          c !== null &&
          "userId" in c &&
          "numericUserId" in c &&
          "name" in c &&
          typeof (c as { numericUserId: unknown }).numericUserId === "number"
      )
      .map((c) => ({
        userId: c.userId,
        numericUserId: c.numericUserId,
        name: c.name,
        photoURL: c.photoURL ?? undefined,
        customId: c.customId ?? undefined,
      }));
  }, [mentionCandidatesData]);

  const handleSubmitComment = useCallback(
    async (text: string, parentId?: string, mentionedUserIds?: number[]) => {
      const res = await createComment({
        targetType: "persona_answer",
        targetId,
        content: text,
        visibility: "public",
        parentId: parentId ? Number(parentId) : undefined,
        mentionedUserIds: mentionedUserIds?.length ? mentionedUserIds : undefined,
      });
      if (res.error) {
        toast.error(t("commentSubmitError"));
        return;
      }
      await mutateComments();
    },
    [targetId, mutateComments, t]
  );

  const handleEditComment = useCallback(
    async (commentId: string, text: string) => {
      const id = Number(commentId);
      if (!Number.isFinite(id)) return false;
      const res = await updateComment(id, { content: text });
      if (res.error) return false;
      await mutateComments();
      return true;
    },
    [mutateComments]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      const id = Number(commentId);
      if (!Number.isFinite(id)) return false;
      const res = await deleteComment(id);
      if (res.error) return false;
      await mutateComments();
      return true;
    },
    [mutateComments]
  );

  return (
    <CommentSection
      comments={comments}
      selectedReactions={[]}
      onSubmit={(content, _reactions, parentId, mentionedUserIds) =>
        handleSubmitComment(content, parentId, mentionedUserIds)
      }
      hasMoreComments={comments.length > 2}
      currentUserName={currentUser?.name ?? undefined}
      currentUserId={currentUser?.id ?? undefined}
      currentUserPhotoURL={currentUser?.photoURL ?? currentUser?.photoUrl ?? undefined}
      mentionCandidates={mentionCandidates}
      onEditComment={handleEditComment}
      onDeleteComment={handleDeleteComment}
    />
  );
}

function PersonaAnswerInteractions({ answerId }: { answerId: number }) {
  const t = useTranslations("persona.detail");
  const targetId = String(answerId);
  const [, startReactionTransition] = useTransition();
  const [pendingReaction, setPendingReaction] = useState<ReactionTypeType | null | undefined>(
    undefined
  );
  const { open: openSheet } = useSheetManager();
  const { isAuthenticated, login } = useAuth();

  // ── Reactions ──────────────────────────────────────────────────────────────
  const { data: reactionsData, mutate: mutateReactions } = useReactions({
    targetType: "persona_answer",
    targetId,
  });
  const currentUserReaction = (reactionsData?.data?.currentUserReaction ??
    null) as ReactionTypeType | null;
  const effectiveReaction = pendingReaction !== undefined ? pendingReaction : currentUserReaction;
  const selectedReactions: ReactionTypeType[] = effectiveReaction ? [effectiveReaction] : [];
  const totalReactionCount = (reactionsData?.data?.reactions ?? []).reduce(
    (sum, r) => sum + r.count,
    0
  );

  const handleReactionToggle = useCallback(
    (type: ReactionTypeType) => {
      if (!isAuthenticated) {
        login();
        return;
      }
      const isSelected = currentUserReaction === type;
      setPendingReaction(isSelected ? null : type);
      startReactionTransition(async () => {
        if (isSelected) {
          await removeReaction({ targetType: "persona_answer", targetId });
        } else {
          await upsertReaction({
            targetType: "persona_answer",
            targetId,
            reactionType: type as ReactionTypeValue,
          });
        }
        await mutateReactions();
        setPendingReaction(undefined);
      });
    },
    [isAuthenticated, login, currentUserReaction, targetId, mutateReactions]
  );

  // ── Comment count (for badge) ──────────────────────────────────────────────
  const { data: commentsData } = useComments({ targetType: "persona_answer", targetId });
  const commentCount = useMemo(() => {
    const raw = commentsData?.data;
    return Array.isArray(raw) ? raw.filter(isApiCommentNode).length : 0;
  }, [commentsData]);

  const handleOpenComments = useCallback(() => {
    if (!isAuthenticated) {
      login();
      return;
    }
    openSheet({
      title: t("commentsTitle"),
      content: <PersonaAnswerCommentSheetContent answerId={answerId} />,
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  }, [isAuthenticated, login, openSheet, answerId, t]);

  return (
    <div className="-mx-4 -mb-4 mt-3 rounded-b-2xl overflow-hidden">
      <div className="flex items-center bg-white border-t border-[#E4EAE9] py-1">
        <div className="flex-1 flex justify-center rounded-xl hover:bg-gray-50 transition-colors py-1 mx-1">
          <ReactionPickerButton
            selectedReactions={selectedReactions}
            onToggle={handleReactionToggle}
            variant="card"
            totalCount={totalReactionCount > 0 ? totalReactionCount : undefined}
          />
        </div>
        <div className="w-px h-5 bg-[#E4EAE9]" />
        <div className="flex-1 flex justify-center rounded-xl hover:bg-gray-50 transition-colors py-1 mx-1">
          <button
            type="button"
            onClick={handleOpenComments}
            className="flex items-center gap-1.5 p-1.5 text-text-dark cursor-pointer"
          >
            <DialogOutlineSvg className="size-[22px]" />
            {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Response item ─────────────────────────────────────────────────────────────

function ResponseItem({ item }: { item: PersonaQuestionAnswerItem }) {
  const t = useTranslations("persona.detail");
  const [expanded, setExpanded] = useState(false);
  const answer = item.selectedValue ?? item.textAnswer ?? "";
  const isLong = answer.length > 70;
  const displayName = item.name ?? "??";
  const initial = displayName[0] ?? "?";

  const AVATAR_COLORS = [
    "#F5A93E",
    "#16B9B3",
    "#9B8FE0",
    "#5BA58C",
    "#E07B7B",
    "#F5C842",
    "#7BB8E0",
  ];
  const colorIndex =
    displayName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  const avatarColor = item.isSelf ? "#16B9B3" : (AVATAR_COLORS[colorIndex] ?? "#16B9B3");

  return (
    <div
      className={cn(
        "rounded-2xl p-4 transition-all duration-200",
        item.isSelf
          ? "bg-logo-cyan/[0.06] border border-logo-cyan/20"
          : "bg-white border border-[#EEF4F4]"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="size-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5"
          style={{ background: avatarColor }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                "text-sm font-semibold",
                item.isSelf ? "text-logo-cyan" : "text-text-dark"
              )}
            >
              {displayName}
            </span>
            {item.isSelf && (
              <span className="text-[10px] text-logo-cyan bg-logo-cyan/10 rounded-full px-2 py-0.5 font-medium leading-none">
                {t("myAnswer")}
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-sm text-text-dark/70 leading-relaxed",
              !expanded && isLong && "line-clamp-2"
            )}
          >
            {answer}
          </p>
          {isLong && (
            // biome-ignore lint/a11y/useKeyWithClickEvents: expand toggle
            // biome-ignore lint/a11y/noStaticElementInteractions: expand toggle
            <div
              className="mt-1.5 flex items-center gap-0.5 text-xs text-text-dark/35 hover:text-text-dark/60 transition-colors cursor-pointer w-fit"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? t("collapse") : t("expand")}
              <ChevronDown
                className={cn("size-3 transition-transform duration-200", expanded && "rotate-180")}
              />
            </div>
          )}
        </div>
      </div>
      <PersonaAnswerInteractions answerId={item.answerId} />
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex justify-center items-center gap-1.5 py-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="size-2 rounded-full bg-logo-cyan/40 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearningPersonaDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("persona.detail");
  const tProfile = useTranslations("persona.myProfile");
  const { isAuthenticated, login } = useAuth();
  const params = useParams();
  const idParam = params?.id;
  const id = typeof idParam === "string" ? Number.parseInt(idParam, 10) : Number.NaN;

  // Question + answers state
  const [questionPrompt, setQuestionPrompt] = useState("");
  const [questionType, setQuestionType] = useState<"choice" | "sentence_completion" | "scenario">(
    "sentence_completion"
  );
  const [questionOptions, setQuestionOptions] = useState<string[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [answers, setAnswers] = useState<PersonaQuestionAnswerItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [answersError, setAnswersError] = useState(false);
  // Inline answer state
  const [cardFlipped, setCardFlipped] = useState(false);
  const [answeredInline, setAnsweredInline] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchAnswers = useCallback(
    async (cursor?: number) => {
      if (Number.isNaN(id)) return;
      setLoading(true);
      try {
        const res = await getPersonaQuestionAnswers(id, { locale, limit: 20, cursor });
        if (res.error) {
          if (cursor == null) {
            setAnswers([]);
            setHasMore(false);
            setNextCursor(undefined);
          }
          setAnswersError(true);
          toast.error(t("loadError"));
          return;
        }
        if (res.data?.data) {
          const { question, answers: newAnswers, hasMore: more, nextCursor: next } = res.data.data;
          setAnswersError(false);
          setAnswers((prev) => (cursor != null ? [...prev, ...newAnswers] : newAnswers));
          setHasMore(more);
          setNextCursor(next ?? undefined);
          if (question) {
            setQuestionPrompt(question.prompt);
            setQuestionType(question.questionType);
            setQuestionOptions(question.options);
            setTotalCount(question.totalAnswerCount);
          }
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [id, locale, t]
  );

  // Initial load
  useEffect(() => {
    setAnswers([]);
    setNextCursor(undefined);
    setHasMore(false);
    setAnswersError(false);
    setInitialLoading(true);
    fetchAnswers();
  }, [fetchAnswers]);

  // Infinite scroll sentinel
  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchAnswers(nextCursor);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, nextCursor, fetchAnswers]);

  const isSelfAnswered = answers.some((a) => a.isSelf);
  const isAnswered = isSelfAnswered || answeredInline;

  const handleAnswerSubmit = async (ans: string, isChoice: boolean) => {
    if (!isAuthenticated) {
      login();
      return;
    }
    try {
      const body = isChoice
        ? { questionId: id, selectedValue: ans }
        : { questionId: id, textAnswer: ans };
      const res = await submitPersonaAnswer(body);
      if (res.error) {
        toast.error(tProfile("submitError"));
        return;
      }
      setAnsweredInline(true);
      setAnswers([]);
      setNextCursor(undefined);
      setInitialLoading(true);
      fetchAnswers();
    } catch {
      toast.error(tProfile("submitError"));
    }
  };

  if (Number.isNaN(id)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-very-light-gray">
        <BackgroundAnimation />
        <p className="text-text-dark/50 text-sm relative z-10">{t("questionNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-y-auto bg-very-light-gray">
      <BackgroundAnimation />

      {/* Close button */}
      <div className="sticky top-0 z-50 flex justify-end px-3 pt-3 pointer-events-none">
        <button
          type="button"
          onClick={() => router.push("/?tab=persona")}
          className="pointer-events-auto flex items-center justify-center size-10 rounded-full text-text-dark/40 bg-very-light-gray/70 backdrop-blur-sm hover:text-logo-cyan hover:bg-white/80 transition-all"
          aria-label={t("close")}
        >
          <X className="size-5" />
        </button>
      </div>

      <main className="relative z-10 max-w-[640px] px-4 mx-auto pb-16 pt-4">
        {initialLoading ? (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl h-[200px] animate-pulse" />
            <div className="bg-white rounded-2xl h-[120px] animate-pulse" />
            <div className="bg-white rounded-2xl h-[120px] animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Question card or flip card */}
            {isAnswered ? (
              <div className="bg-white rounded-2xl shadow-sm px-5 py-4 mb-2">
                <p className="text-base font-bold text-text-dark leading-snug">{questionPrompt}</p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-logo-cyan font-medium bg-logo-cyan/10 rounded-full px-2.5 py-1">
                    {tProfile("answeredLabel")}
                  </span>
                  {totalCount != null && totalCount > 0 && (
                    <span className="text-xs text-text-dark/35">
                      {t("responseCount", { count: totalCount })}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <InlineFlipCard
                prompt={questionPrompt}
                questionType={questionType}
                options={questionOptions}
                flipped={cardFlipped}
                onFlippedChange={setCardFlipped}
                onSubmit={handleAnswerSubmit}
              />
            )}

            {/* Responses section */}
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-text-dark/70 px-1">
                {t("responsesTitle")}
              </h2>

              {answersError ? (
                <div className="bg-white rounded-2xl shadow-sm px-5 py-8 text-center">
                  <p className="text-sm text-text-dark/40">{t("loadError")}</p>
                </div>
              ) : isAnswered ? (
                <>
                  {answeredInline && (
                    <div className="bg-logo-cyan/[0.06] border border-logo-cyan/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-logo-cyan shrink-0" />
                      <p className="text-sm text-text-dark/70 leading-relaxed">
                        {t("answerAdded")}
                      </p>
                    </div>
                  )}

                  {answers.map((item) => (
                    <ResponseItem key={item.answerId} item={item} />
                  ))}

                  {hasMore && (
                    <>
                      {loading && <LoadingDots />}
                      <div ref={sentinelRef} className="h-4" />
                    </>
                  )}

                  {!hasMore && answers.length > 0 && (
                    <p className="text-center text-xs text-text-dark/30 py-4">
                      {t("allResponsesShown", { count: answers.length })}
                    </p>
                  )}

                  {!hasMore && answers.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm px-5 py-8 text-center">
                      <p className="text-sm text-text-dark/40">{t("emptyResponses")}</p>
                    </div>
                  )}
                </>
              ) : (
                /* Not answered yet */
                <div className="bg-white rounded-2xl shadow-sm px-5 py-8 flex flex-col items-center gap-3 text-center">
                  <p className="text-sm font-medium text-text-dark/70">{t("lockedResponses")}</p>
                  {totalCount != null && totalCount > 0 && (
                    <p className="text-xs text-text-dark/35">
                      {t("answeredCount", { count: totalCount })}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCardFlipped(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="mt-1 text-sm font-medium text-white bg-logo-cyan rounded-full px-5 py-2.5 hover:bg-logo-cyan/90 active:scale-95 transition-all"
                  >
                    {t("shareThoughts")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
