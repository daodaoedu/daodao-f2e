"use client";

import {
  type FeedbackState,
  type ITopicCard,
  submitRecommendationFeedback,
  useTopicRecommendations,
} from "@daodao/api";
import { posthogCapture } from "@daodao/analytics";
import { useRouter } from "@daodao/i18n/navigation";
import { Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ── Creator Avatar ────────────────────────────────────────────

function CreatorAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = ["#4CAF93", "#6B9FD4", "#E8845A", "#9B7EC8", "#D4A843"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-medium shrink-0"
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
  );
}

// ── Recommendation Card ───────────────────────────────────────

interface RecommendationCardProps {
  card: ITopicCard;
  onDislike: (card: ITopicCard) => void;
  onLike: (card: ITopicCard) => void;
}

function RecommendationCard({ card, onDislike, onLike }: RecommendationCardProps) {
  const router = useRouter();
  const [feedbackState, setFeedbackState] = useState<FeedbackState>(card.feedbackState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardClick = useCallback(() => {
    posthogCapture("recommendation_card_clicked", {
      entity_type: "practice",
      entity_id: card.practiceId,
      match_reason_code: card.matchReasonCode,
      platform: "web",
    });
    router.push(`/practices/${card.practiceId}`);
  }, [card.practiceId, card.matchReasonCode, router]);

  const handleFeedback = useCallback(
    async (type: "like" | "dislike") => {
      if (isSubmitting) return;
      if (type === "dislike") {
        posthogCapture("recommendation_feedback_disliked", {
          entity_id: card.practiceId,
          match_reason_code: card.matchReasonCode,
          platform: "web",
        });
        onDislike(card);
        return;
      }
      setIsSubmitting(true);
      try {
        const newState = await submitRecommendationFeedback(card.practiceId, "like");
        setFeedbackState(newState);
        posthogCapture("recommendation_feedback_liked", {
          entity_id: card.practiceId,
          match_reason_code: card.matchReasonCode,
          platform: "web",
        });
        onLike(card);
      } catch {
        // silent fail
      } finally {
        setIsSubmitting(false);
      }
    },
    [card, isSubmitting, onDislike, onLike]
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E8F8FF] flex flex-col min-w-[240px] md:min-w-0 overflow-hidden">
      {/* Clickable body */}
      <button
        type="button"
        onClick={handleCardClick}
        className="flex flex-col gap-3 p-4 text-left w-full hover:bg-[#F9FFFE] transition-colors"
      >
        {/* Reason chip */}
        <div className="inline-flex items-center gap-1 bg-[#F0FBF8] text-[#4CAF93] text-xs font-medium px-2 py-1 rounded-full self-start max-w-full">
          <Sparkles size={11} className="shrink-0" />
          <span className="truncate">{card.matchReasonText}</span>
        </div>

        {/* Title & description */}
        <div>
          <h3 className="font-semibold text-text-dark text-base leading-snug line-clamp-2">
            {card.title}
          </h3>
          {card.description && (
            <p className="text-text-dark/50 text-xs mt-1 line-clamp-2">{card.description}</p>
          )}
        </div>

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-text-dark/60 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Footer: creator + feedback */}
      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <CreatorAvatar name={card.creator.name} />
          <span className="text-xs text-text-dark/60 truncate">{card.creator.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleFeedback("like")}
            disabled={isSubmitting}
            className={`p-1 rounded-full transition-colors ${
              feedbackState === "liked"
                ? "text-[#4CAF93]"
                : "text-text-dark/30 hover:text-text-dark/60"
            }`}
            aria-label="喜歡"
          >
            <ThumbsUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleFeedback("dislike")}
            disabled={isSubmitting}
            className="p-1 rounded-full text-text-dark/30 hover:text-text-dark/60 transition-colors"
            aria-label="不喜歡"
          >
            <ThumbsDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

function RecommendationSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E8F8FF] flex flex-col gap-3 min-w-[240px] md:min-w-0 animate-pulse">
      <div className="h-5 bg-gray-100 rounded-full w-2/3" />
      <div className="space-y-1.5">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-4/5" />
      </div>
      <div className="flex gap-1">
        <div className="h-5 bg-gray-100 rounded-full w-12" />
        <div className="h-5 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div className="h-4 bg-gray-100 rounded w-20" />
        <div className="flex gap-2">
          <div className="w-6 h-6 bg-gray-100 rounded-full" />
          <div className="w-6 h-6 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────

function RecommendationEmptyState({ onGoToInspire }: { onGoToInspire: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8F8FF] flex flex-col items-center gap-3 text-center">
      <Sparkles size={28} className="text-[#4CAF93]" />
      <div>
        <p className="font-medium text-text-dark text-sm">目前沒有推薦內容</p>
        <p className="text-text-dark/50 text-xs mt-1">去靈感頁看看大家在實踐什麼</p>
      </div>
      <button
        type="button"
        onClick={onGoToInspire}
        className="text-[#4CAF93] text-sm font-medium underline underline-offset-2"
      >
        前往靈感頁
      </button>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────

interface RecommendationSectionProps {
  onGoToInspire: () => void;
}

export function RecommendationSection({ onGoToInspire }: RecommendationSectionProps) {
  const [displayedCards, setDisplayedCards] = useState<ITopicCard[]>([]);
  const [initialized, setInitialized] = useState(false);

  const excludeIds = displayedCards.map((c) => c.targetId);
  const refillLimit = 1;

  const { cards: fetchedCards, isLoading } = useTopicRecommendations({ limit: 3 });

  // 首次載入：設定 displayedCards
  if (!initialized && !isLoading && fetchedCards.length > 0) {
    setDisplayedCards(fetchedCards);
    setInitialized(true);
  }
  if (!initialized && !isLoading && fetchedCards.length === 0 && !initialized) {
    setInitialized(true);
  }

  const { cards: refillCards, mutate: refillMutate } = useTopicRecommendations({
    limit: refillLimit,
    excludeIds,
    enabled: false,
  });

  useEffect(() => {
    if (initialized && displayedCards.length > 0) {
      posthogCapture("recommendation_section_viewed", {
        card_count: displayedCards.length,
        platform: "web",
      });
    }
  }, [initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDislike = useCallback(
    async (card: ITopicCard) => {
      // Optimistic remove
      setDisplayedCards((prev) => prev.filter((c) => c.practiceId !== card.practiceId));

      try {
        await submitRecommendationFeedback(card.practiceId, "dislike");
        // 補卡
        await refillMutate();
        if (refillCards.length > 0) {
          setDisplayedCards((prev) => {
            const existingIds = new Set(prev.map((c) => c.practiceId));
            const newCard = refillCards.find((c) => !existingIds.has(c.practiceId));
            return newCard ? [...prev, newCard] : prev;
          });
        }
      } catch {
        // silent fail — card already removed optimistically
      }
    },
    [refillCards, refillMutate]
  );

  const handleLike = useCallback((card: ITopicCard) => {
    setDisplayedCards((prev) =>
      prev.map((c) =>
        c.practiceId === card.practiceId ? { ...c, feedbackState: "liked" as FeedbackState } : c
      )
    );
  }, []);

  return (
    <section className="mb-6">
      <div className="max-w-[640px] px-5 mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[#4CAF93]" />
          <h2 className="font-semibold text-text-dark text-sm">探索相關主題</h2>
          <span className="text-text-dark/40 text-xs">看看其他人都在實踐什麼</span>
        </div>

        {/* Cards */}
        {isLoading || !initialized ? (
          <div className="flex overflow-x-auto gap-3 scrollbar-hide md:grid md:grid-cols-3">
            {[1, 2, 3].map((i) => <RecommendationSkeleton key={i} />)}
          </div>
        ) : displayedCards.length === 0 ? (
          <RecommendationEmptyState onGoToInspire={onGoToInspire} />
        ) : (
          <div className="flex overflow-x-auto gap-3 scrollbar-hide md:grid md:grid-cols-3">
            {displayedCards.map((card) => (
              <RecommendationCard
                key={card.practiceId}
                card={card}
                onDislike={handleDislike}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
