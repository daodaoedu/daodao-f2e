"use client";

import {
  followTarget,
  unfollowTarget,
  useComments,
  usePracticeById,
  useReactionsList,
} from "@daodao/api";
import {
  ChartColumnIncreasingSvg,
  DefaultAvatarSvg,
  DialogOutlineSvg,
  FlagOutlineSvg,
  TelescopeSvg,
} from "@daodao/assets";
import { Link, useRouter } from "@daodao/i18n/navigation";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ReactionPickerButton } from "@/components/check-in/reactions";
import {
  BrowseActivityContent,
  type IBrowseActivityFollower,
} from "@/components/practice/shared/browse-activity-content";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { getStatusConfig, TaskStatus } from "@/constants/task-status";
import { useCardReactions } from "@/hooks/use-card-reactions";
import { formatRelativeTime } from "@/utils/format-time";
import { formatShowcaseDate } from "./utils";

interface PracticeShowcaseCardProps {
  id: string;
  title: string;
  status: "active" | "completed";
  startDate?: string | null;
  endDate?: string | null;
  user?: {
    id: string;
    name: string;
    photoUrl?: string | null;
  };
  actionDescription?: string | null;
  frequencyMinDays?: number | null;
  frequencyMaxDays?: number | null;
  sessionDurationMinutes?: number | null;
  commentCount?: number;
}

export function PracticeShowcaseCard({
  id,
  title,
  status,
  startDate,
  endDate,
  user,
  actionDescription,
  frequencyMinDays,
  frequencyMaxDays,
  sessionDurationMinutes,
  commentCount = 0,
}: PracticeShowcaseCardProps) {
  const startFmt = formatShowcaseDate(startDate);
  const endFmt = formatShowcaseDate(endDate);
  const taskStatus = status === "active" ? TaskStatus.inProgress : TaskStatus.completed;
  const statusInfo = getStatusConfig(taskStatus);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { open: openSheet, close: closeSheet } = useSheetManager();
  const { data: practiceData } = usePracticeById(id);
  const { data: reactionsListData } = useReactionsList({ targetType: "practice", targetId: id });
  const { data: commentsData } = useComments({ targetType: "practice", targetId: id });

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const handleToggleFollow = async () => {
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await unfollowTarget("practice", id);
        toast.success("已取消關注");
      } else {
        await followTarget({ targetType: "practice", targetId: id });
        toast.success("已關注此實踐");
      }
    } catch {
      setIsFollowing(wasFollowing);
      toast.error("操作失敗，請稍後再試");
    }
  };

  const handleOpenBrowseActivity = () => {
    setMenuOpen(false);
    const followers: IBrowseActivityFollower[] = (reactionsListData?.data?.items ?? []).map(
      (item) => ({
        id: item.userId,
        name: item.name,
        photoURL: item.photoURL ?? undefined,
        time: formatRelativeTime(item.reactedAt),
        reaction: item.reactionType as ReactionTypeType,
      })
    );
    openSheet({
      title: "瀏覽活動",
      content: (
        <BrowseActivityContent
          viewCount={practiceData?.data?.stats?.viewCount ?? 0}
          commentCount={commentsData?.data?.length ?? commentCount}
          followers={followers}
          onClose={() => closeSheet()}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  };

  const { selectedReactions, totalCount, displayReactions, handleToggle } = useCardReactions(
    "practice",
    id
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: card click for navigation
    // biome-ignore lint/a11y/noStaticElementInteractions: card click for navigation
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8F8FF] cursor-pointer"
      onClick={() => router.push(`/practices/${id}`)}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={statusInfo.variant} size="sm" className="w-fit text-[10px]">
          {statusInfo.label}
        </Badge>
        {startFmt && endFmt && (
          <span className="text-xs text-text-dark/50 flex-1">
            {startFmt} ▶ {endFmt}
          </span>
        )}

        {/* More menu */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop card click */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: stop card click */}
        <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn("h-8 w-8", menuOpen ? "bg-[#E4EAE9]" : "hover:bg-[#E4EAE9]")}
          >
            <MoreHorizontal className="size-4" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[140px]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMenuOpen(false);
                  window.open("https://tally.so/r/BzGQy4", "_blank");
                }}
                className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
              >
                <FlagOutlineSvg className="size-5 shrink-0" />
                <span>檢舉</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMenuOpen(false);
                  void handleToggleFollow();
                }}
                className={cn(
                  "w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm transition-colors cursor-pointer",
                  isFollowing
                    ? "text-logo-cyan hover:bg-[#E8FAF9]"
                    : "text-[#295E5C] hover:bg-[#F0F9F8]"
                )}
              >
                <TelescopeSvg className="size-5 shrink-0" />
                <span>{isFollowing ? "取消關注" : "關注"}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleOpenBrowseActivity}
                className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
              >
                <ChartColumnIncreasingSvg className="size-5 shrink-0" />
                <span>瀏覽活動</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-text-dark text-base mb-2 line-clamp-2">{title}</h3>

      {/* Avatar + action/frequency block */}
      {(user ||
        actionDescription ||
        frequencyMinDays ||
        frequencyMaxDays ||
        sessionDurationMinutes) && (
        <div className="flex items-start gap-3 mb-3">
          {user && (
            // biome-ignore lint/a11y/useKeyWithClickEvents: stop card click
            // biome-ignore lint/a11y/noStaticElementInteractions: stop card click
            <span onClick={(e) => e.stopPropagation()}>
              <Link href={`/users/${user.id}`} className="shrink-0">
                <Avatar className="size-16">
                  {user.photoUrl && <AvatarImage src={user.photoUrl} />}
                  <AvatarFallback>
                    <DefaultAvatarSvg />
                  </AvatarFallback>
                </Avatar>
              </Link>
            </span>
          )}
          <div className="flex-1 min-w-0">
            {actionDescription && (
              <p className="text-sm text-text-dark/80 mb-2 line-clamp-3">{actionDescription}</p>
            )}
            {(frequencyMinDays || frequencyMaxDays || sessionDurationMinutes) && (
              <div className="flex items-center gap-4">
                {(frequencyMinDays || frequencyMaxDays) && (
                  <span className="text-sm">
                    <span className="font-semibold text-logo-cyan">
                      {frequencyMinDays === frequencyMaxDays
                        ? frequencyMinDays
                        : `${frequencyMinDays}-${frequencyMaxDays}`}
                    </span>
                    <span className="text-text-dark/60 ml-0.5">天/週</span>
                  </span>
                )}
                {sessionDurationMinutes && (
                  <span className="text-sm">
                    <span className="font-semibold text-logo-cyan">{sessionDurationMinutes}</span>
                    <span className="text-text-dark/60 ml-0.5">分鐘/次</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom bar: summary layout */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop card click */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: stop card click */}
      <div
        className="flex items-center justify-between border-t border-[#E4EAE9] pt-3 mt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <ReactionPickerButton
          selectedReactions={selectedReactions}
          onToggle={handleToggle}
          variant="summary"
          totalCount={totalCount}
          displayReactions={displayReactions}
          firstReactorName={reactionsListData?.data?.items[0]?.name}
        />

        <Link
          href={`/practices/${id}`}
          className="flex items-center gap-1.5 text-[#9FB5B8] hover:text-text-dark transition-colors"
        >
          <DialogOutlineSvg className="size-6" />
          {(() => {
            const count = commentsData?.data?.length ?? commentCount;
            return count > 0 ? <span className="text-sm font-medium">{count}</span> : null;
          })()}
        </Link>
      </div>

      {/* Comment preview: up to 2 latest top-level comments */}
      {(() => {
        const allComments = commentsData?.data ?? [];
        const preview = allComments.slice(-2);
        if (preview.length === 0) return null;
        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          // biome-ignore lint/a11y/useKeyWithClickEvents: stop card click
          // biome-ignore lint/a11y/noStaticElementInteractions: stop card click
          <div
            className="mt-3 flex flex-col gap-2 border-t border-[#E4EAE9] pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            {preview.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <Avatar className="size-6 shrink-0 mt-0.5">
                  {comment.user?.photoURL && (
                    <AvatarImage src={comment.user.photoURL} alt={comment.user.name} />
                  )}
                  <AvatarFallback className="text-[10px] font-medium text-text-dark bg-[#E8FAF9]">
                    {(comment.user?.name ?? "?").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#295E5C] mr-1.5">
                    {comment.user?.name ?? "匿名"}
                  </span>
                  <span className="text-xs text-text-dark line-clamp-1">{comment.content}</span>
                </div>
                <span className="shrink-0 text-[11px] text-[#9FB5B8]">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
