"use client";

import { posthogCapture } from "@daodao/analytics";
import {
  type FeedbackState,
  fetchTopicCards,
  type ITopicCard,
  submitRecommendationFeedback,
  useTopicRecommendations,
} from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Creator Avatar ────────────────────────────────────────────

function CreatorAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = ["#4CAF93", "#6B9FD4", "#E8845A", "#9B7EC8", "#D4A843"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
  );
}

// ── Recommendation Card ───────────────────────────────────────

interface RecommendationCardProps {
  card: ITopicCard;
  isHiding: boolean;
  onDislike: (card: ITopicCard) => void;
  onLike: (card: ITopicCard) => void;
}

function RecommendationCard({ card, isHiding, onDislike, onLike }: RecommendationCardProps) {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>(card.feedbackState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const href = `/practices/${card.practiceId}`;

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
      const isCurrentlyLiked = feedbackState === "liked";
      setIsSubmitting(true);
      try {
        const newState = await submitRecommendationFeedback(card.practiceId, "like");
        setFeedbackState(newState);
        posthogCapture("recommendation_feedback_liked", {
          entity_id: card.practiceId,
          match_reason_code: card.matchReasonCode,
          platform: "web",
        });
        if (!isCurrentlyLiked) {
          toast.success("收到！往後你會更容易看到類似的主題喔！");
        }
        onLike(card);
      } catch {
        // silent fail
      } finally {
        setIsSubmitting(false);
      }
    },
    [card, feedbackState, isSubmitting, onDislike, onLike]
  );

  return (
    <div
      className={cn(
        "w-[260px] shrink-0 relative bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm transition-all duration-300 ease-out",
        isHiding ? "opacity-0 scale-95 pointer-events-none" : "hover:shadow-md hover:scale-[1.02]"
      )}
    >
      {/* Navigation link overlay — z-[1] */}
      <CustomLink
        href={href}
        className="absolute inset-0 z-[1] rounded-xl"
        aria-label={card.title}
        onClick={() =>
          posthogCapture("recommendation_card_clicked", {
            entity_type: "practice",
            entity_id: card.practiceId,
            match_reason_code: card.matchReasonCode,
            platform: "web",
          })
        }
      />

      {/* Card body */}
      <div className="flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-3 p-4 pb-0">
          <h3 className="text-[17px] font-bold text-text-dark leading-snug line-clamp-2">
            {card.title}
          </h3>
          {card.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{card.description}</p>
          )}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: creator + feedback — z-[2]，高於 link overlay */}
        <div className="relative z-[2] flex items-center justify-between px-4 pb-4 mt-4">
          <div className="flex items-center gap-2 min-w-0">
            <CreatorAvatar name={card.creator.name} />
            <span className="text-sm text-text-dark font-medium truncate">{card.creator.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFeedback("like")}
              disabled={isSubmitting}
              className={cn(
                "size-8 transition-colors",
                feedbackState === "liked"
                  ? "text-primary-base hover:text-primary-darker"
                  : "text-gray-400 hover:text-primary-base"
              )}
              aria-label="喜歡"
            >
              <ThumbsUp
                className="size-4"
                fill={feedbackState === "liked" ? "currentColor" : "none"}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.currentTarget.blur();
                handleFeedback("dislike");
              }}
              disabled={isSubmitting}
              className="size-8 text-gray-400 hover:text-red-400"
              aria-label="不喜歡"
            >
              <ThumbsDown className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

function RecommendationSkeleton() {
  return (
    <div className="w-[260px] shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden animate-pulse">
      <div className="h-11 bg-gray-100 rounded-t-[11px]" />
      <div className="flex flex-col gap-3 p-4 pb-0">
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="space-y-1.5">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 bg-gray-100 rounded w-12" />
          <div className="h-5 bg-gray-100 rounded w-16" />
        </div>
      </div>
      <div className="flex items-center justify-between px-4 pb-4 mt-4">
        <div className="h-4 bg-gray-100 rounded w-20" />
        <div className="flex gap-1">
          <div className="size-8 bg-gray-100 rounded" />
          <div className="size-8 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────

function RecommendationEmptyState({ onGoToInspire }: { onGoToInspire: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="font-bold text-text-dark">暫時沒有推薦</p>
      <p className="text-sm text-gray-500 max-w-[280px]">
        你可以先專注於當前的計畫，或到「靈感」分頁看看其他主題實踐
      </p>
      <Button variant="outline" onClick={onGoToInspire} className="mt-1">
        去看看靈感
      </Button>
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
  const [hidingIds, setHidingIds] = useState<Set<string>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hideTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const hidingCardsRef = useRef<Map<string, ITopicCard>>(new Map());

  const { cards: fetchedCards, isLoading } = useTopicRecommendations({ limit: 3 });

  // 首次載入：設定 displayedCards
  useEffect(() => {
    if (initialized || isLoading) return;
    if (fetchedCards.length > 0) {
      setDisplayedCards(fetchedCards);
    }
    setInitialized(true);
  }, [initialized, isLoading, fetchedCards]);

  useEffect(() => {
    if (initialized && displayedCards.length > 0) {
      posthogCapture("recommendation_section_viewed", {
        card_count: displayedCards.length,
        platform: "web",
      });
    }
  }, [initialized, displayedCards.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timers = hideTimersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
    };
  }, []);

  const handleUndoHide = useCallback((id: string) => {
    const timer = hideTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      hideTimersRef.current.delete(id);
    } else {
      // Timer already fired — card was removed, restore it
      const card = hidingCardsRef.current.get(id);
      if (card) {
        setDisplayedCards((prev) => [card, ...prev]);
      }
    }
    hidingCardsRef.current.delete(id);
    setHidingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleDislike = useCallback(
    (card: ITopicCard) => {
      setHidingIds((prev) => new Set([...prev, card.practiceId]));
      hidingCardsRef.current.set(card.practiceId, card);

      const timer = setTimeout(async () => {
        setDisplayedCards((prev) => prev.filter((c) => c.practiceId !== card.practiceId));
        setHidingIds((prev) => {
          const next = new Set(prev);
          next.delete(card.practiceId);
          return next;
        });
        hideTimersRef.current.delete(card.practiceId);

        try {
          await submitRecommendationFeedback(card.practiceId, "dislike");
          const currentExcludeIds = displayedCards
            .filter((c) => c.practiceId !== card.practiceId)
            .map((c) => c.targetId);
          const newCards = await fetchTopicCards({ limit: 1, excludeIds: currentExcludeIds });
          if (newCards.length > 0) {
            setDisplayedCards((prev) => {
              const existingIds = new Set(prev.map((c) => c.practiceId));
              const newCard = newCards.find((c) => !existingIds.has(c.practiceId));
              return newCard ? [...prev, newCard] : prev;
            });
          }
        } catch {
          // silent fail
        }
      }, 300);

      hideTimersRef.current.set(card.practiceId, timer);

      toast.success("已隱藏此推薦", {
        action: {
          label: "復原",
          onClick: () => handleUndoHide(card.practiceId),
        },
      });
    },
    [displayedCards, handleUndoHide]
  );

  const handleLike = useCallback((card: ITopicCard) => {
    setDisplayedCards((prev) =>
      prev.map((c) =>
        c.practiceId === card.practiceId ? { ...c, feedbackState: "liked" as FeedbackState } : c
      )
    );
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const excludeIds = displayedCards.map((c) => c.targetId);
      const newCards = await fetchTopicCards({ limit: 3, excludeIds });
      if (newCards.length > 0) {
        setDisplayedCards((prev) => {
          const existingIds = new Set(prev.map((c) => c.practiceId));
          return [...prev, ...newCards.filter((c) => !existingIds.has(c.practiceId))];
        });
      } else {
        toast.info("目前沒有更多推薦了");
      }
    } catch {
      toast.error("載入失敗，請稍後再試");
    } finally {
      setIsLoadingMore(false);
    }
  }, [displayedCards, isLoadingMore]);

  return (
    <section className="pt-8 flex flex-col gap-4 mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-xl font-bold text-text-dark">✦ 探索相關主題</h2>
        <span className="text-sm text-gray-400">看看其他人都在實踐什麼</span>
      </div>

      {/* Cards */}
      {isLoading || !initialized ? (
        <div className="-mx-4 px-4 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {[1, 2, 3].map((i) => (
            <RecommendationSkeleton key={i} />
          ))}
        </div>
      ) : displayedCards.length === 0 ? (
        <RecommendationEmptyState onGoToInspire={onGoToInspire} />
      ) : (
        <>
          <div className="-mx-4 px-4 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {displayedCards.map((card) => (
              <RecommendationCard
                key={card.practiceId}
                card={card}
                isHiding={hidingIds.has(card.practiceId)}
                onDislike={handleDislike}
                onLike={handleLike}
              />
            ))}

            {/* 查看更多推薦 */}
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="w-[260px] shrink-0 flex flex-col items-center justify-center gap-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl">{isLoadingMore ? "…" : "＋"}</span>
              <span className="text-sm font-medium leading-snug text-center px-4">
                查看更多推薦
              </span>
            </button>

            <div className="shrink-0 w-4" aria-hidden="true" />
          </div>
          <span className="text-xs text-gray-400">此主題為AI生成推薦</span>
        </>
      )}
    </section>
  );
}
