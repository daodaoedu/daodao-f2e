"use client";

import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Compass, ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { IExploreTopicRecommendation } from "@/hooks/use-challenges";

const DEFAULT_VISIBLE_COUNT = 3;

interface ExploreTopicCardProps {
  topic: IExploreTopicRecommendation;
  isLiked: boolean;
  isHiding: boolean;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
}

function ExploreTopicCard({ topic, isLiked, isHiding, onLike, onDislike }: ExploreTopicCardProps) {
  const {
    id,
    title,
    description,
    tags,
    reason,
    authorName,
    authorAvatarChar,
    authorAvatarColor,
    practiceId,
  } = topic;

  const href = practiceId
    ? practiceId === "dev-preview"
      ? "/dev/practice-preview"
      : `/practices/${practiceId}`
    : null;

  return (
    <div
      className={cn(
        "w-[260px] shrink-0 relative bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm transition-all duration-300 ease-out",
        isHiding ? "opacity-0 scale-95 pointer-events-none" : "hover:shadow-md hover:scale-[1.02]"
      )}
    >
      {/* Navigation link overlay — z-[1]，點卡片任意處導頁 */}
      {href && (
        <CustomLink
          href={href}
          className="absolute inset-0 z-[1] rounded-xl"
          aria-label={title}
        />
      )}

      {/* AI Reason tag */}
      <div className="bg-primary-palest text-primary-base text-xs px-3 py-3 rounded-t-[11px]">
        {reason}
      </div>

      {/* Card body */}
      <div className="flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-3 p-4 pb-0">
          {/* Title */}
          <h3 className="text-[17px] font-bold text-text-dark leading-snug">{title}</h3>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer: author + feedback — z-[2]，高於 link overlay，按鈕不觸發導頁 */}
        <div className="relative z-[2] flex items-center justify-between px-4 pb-4 mt-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: authorAvatarColor }}
            >
              {authorAvatarChar}
            </div>
            <span className="text-sm text-text-dark font-medium">{authorName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLike(id)}
              className={cn(
                "size-8 transition-colors",
                isLiked
                  ? "text-primary-base hover:text-primary-darker"
                  : "text-gray-400 hover:text-primary-base"
              )}
            >
              <ThumbsUp className="size-4" fill={isLiked ? "currentColor" : "none"} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.currentTarget.blur();
                onDislike(id);
              }}
              className="size-8 text-gray-400 hover:text-red-400"
            >
              <ThumbsDown className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExploreTopicsSectionProps {
  topics: IExploreTopicRecommendation[];
  onNavigateToInspiration?: () => void;
}

export function ExploreTopicsSection({
  topics,
  onNavigateToInspiration,
}: ExploreTopicsSectionProps) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [hidingIds, setHidingIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const hideTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const visibleTopics = topics.filter((t) => !hiddenIds.has(t.id));
  const displayedTopics = showAll ? visibleTopics : visibleTopics.slice(0, DEFAULT_VISIBLE_COUNT);
  const hasMore = !showAll && visibleTopics.length > DEFAULT_VISIBLE_COUNT;

  const handleLike = useCallback(
    (id: string) => {
      const isCurrentlyLiked = likedIds.has(id);
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      if (!isCurrentlyLiked) {
        toast.success("收到！往後你會更容易看到類似的主題喔！");
      }
    },
    [likedIds]
  );

  const handleUndoHide = useCallback((id: string) => {
    // Cancel pending hide timer if still animating
    const timer = hideTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      hideTimersRef.current.delete(id);
    }
    setHidingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleDislike = useCallback(
    (id: string) => {
      // Start exit animation
      setHidingIds((prev) => new Set([...prev, id]));
      // After animation completes, remove from list
      const timer = setTimeout(() => {
        setHiddenIds((prev) => new Set([...prev, id]));
        setHidingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        hideTimersRef.current.delete(id);
      }, 300);
      hideTimersRef.current.set(id, timer);
      toast.success("已隱藏此推薦", {
        action: {
          label: "復原",
          onClick: () => handleUndoHide(id),
        },
      });
    },
    [handleUndoHide]
  );

  if (topics.length === 0) return null;

  return (
    <div className="pt-8 flex flex-col gap-4">
      {/* Section header */}
      <div className="max-w-[640px] mx-auto px-4 w-full flex items-center gap-2 flex-wrap">
        <h2 className="text-xl font-bold text-text-dark">✦ 探索相關主題</h2>
        <span className="text-sm text-gray-400">看看其他人都在實踐什麼</span>
      </div>

      {/* Empty state */}
      {visibleTopics.length === 0 ? (
        <div className="max-w-[640px] mx-auto px-4 w-full flex flex-col items-center gap-3 py-10 text-center">
          <Compass className="size-12 text-gray-300" />
          <p className="font-bold text-text-dark">暫時沒有推薦</p>
          <p className="text-sm text-gray-500 max-w-[280px]">
            你可以先專注於當前的計畫，或到「靈感」分頁看看其他主題實踐
          </p>
          {onNavigateToInspiration && (
            <Button variant="outline" onClick={onNavigateToInspiration} className="mt-1">
              去看看靈感
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Horizontal card list */}
          <div className="pl-4 md:pl-[calc((100vw-640px)/2+1rem)] flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {displayedTopics.map((topic) => (
              <ExploreTopicCard
                key={topic.id}
                topic={topic}
                isLiked={likedIds.has(topic.id)}
                isHiding={hidingIds.has(topic.id)}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            ))}

            {/* Show more card */}
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="w-[260px] shrink-0 flex flex-col items-center justify-center gap-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <span className="text-2xl">＋</span>
                <span className="text-sm font-medium leading-snug text-center px-4">
                  查看更多推薦
                </span>
              </button>
            )}

            <div className="shrink-0 w-4" aria-hidden="true" />
          </div>

          {/* AI label */}
          <div className="max-w-[640px] mx-auto px-4 w-full">
            <span className="text-xs text-gray-400">此主題為AI生成推薦</span>
          </div>
        </>
      )}
    </div>
  );
}
