"use client";

import type { ReactionTypeValue } from "@daodao/api";
import {
  followTarget,
  removeReaction,
  unfollowTarget,
  upsertReaction,
  useReactions,
  useReactionsList,
} from "@daodao/api";
import {
  ChartColumnIncreasingSvg,
  DefaultAvatarSvg,
  DialogOutlineSvg,
  FlagOutlineSvg,
  TelescopeSvg,
} from "@daodao/assets";
import { Link } from "@daodao/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ReactionPickerButton } from "@/components/check-in/reactions";
import {
  BrowseActivityContent,
  type IBrowseActivityFollower,
} from "@/components/practice/shared/browse-activity-content";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { getStatusConfig, TaskStatus } from "@/constants/task-status";
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
  const { open: openSheet } = useSheetManager();
  const { data: reactionsListData } = useReactionsList({ targetType: "practice", targetId: id });

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
          viewCount={0}
          commentCount={commentCount}
          followers={followers}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  };

  const { data: reactionsData, mutate } = useReactions({ targetType: "practice", targetId: id });
  const [, startTransition] = useTransition();

  const currentUserReaction = (reactionsData?.data?.currentUserReaction ?? null) as ReactionTypeType | null;
  const selectedReactions: ReactionTypeType[] = currentUserReaction ? [currentUserReaction] : [];
  const allReactions = reactionsData?.data?.reactions ?? [];
  const totalCount = allReactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactions = allReactions.filter((r) => r.count > 0).map((r) => r.type as ReactionTypeType);

  const handleToggle = useCallback(
    (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      startTransition(async () => {
        if (isSelected) {
          await removeReaction({ targetType: "practice", targetId: id });
        } else {
          await upsertReaction({ targetType: "practice", targetId: id, reactionType: type as ReactionTypeValue });
        }
        await mutate();
      });
    },
    [currentUserReaction, id, mutate],
  );

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8F8FF]">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={statusInfo.variant} size="sm" className="w-fit">
          {statusInfo.label}
        </Badge>
        {startFmt && endFmt && (
          <span className="text-xs text-text-dark/50 flex-1">
            {startFmt} ▶ {endFmt}
          </span>
        )}

        {/* More menu */}
        <div ref={menuRef} className="relative">
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
      <Link href={`/practices/${id}`}>
        <h3 className="font-semibold text-text-dark text-base mb-2 line-clamp-2 hover:underline">
          {title}
        </h3>
      </Link>

      {/* Avatar + action/frequency block */}
      {(user || actionDescription || frequencyMinDays || frequencyMaxDays || sessionDurationMinutes) && (
        <div className="flex items-start gap-3 mb-3">
          {user && (
            <Link href={`/users/${user.id}`} className="shrink-0">
              <Avatar className="size-16">
                {user.photoUrl && <AvatarImage src={user.photoUrl} />}
                <AvatarFallback>
                  <DefaultAvatarSvg />
                </AvatarFallback>
              </Avatar>
            </Link>
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

      {/* Bottom bar: reaction + comment (same pattern as detail page) */}
      <div className="flex items-center border-t border-[#E4EAE9] pt-3 mt-3">
        <div className="flex-1 flex justify-center rounded-xl hover:bg-gray-100 transition-colors py-1">
          <ReactionPickerButton
            selectedReactions={selectedReactions}
            onToggle={handleToggle}
            variant="card"
            totalCount={totalCount}
            displayReactions={displayReactions}
          />
        </div>

        <div className="w-px h-5 bg-[#E4EAE9]" />

        <Link
          href={`/practices/${id}`}
          className="flex-1 flex justify-center rounded-xl hover:bg-gray-100 transition-colors py-1"
        >
          <div className="flex items-center gap-1.5 p-1.5 text-text-dark">
            <DialogOutlineSvg className="size-[22px]" />
            {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
          </div>
        </Link>
      </div>
    </div>
  );
}
