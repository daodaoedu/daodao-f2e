"use client";

import type { BatchReactionItem } from "@daodao/api";
import { followTarget, unfollowTarget, useComments, usePracticeById } from "@daodao/api";
import {
  ChartColumnIncreasingSvg,
  DefaultAvatarSvg,
  DialogOutlineSvg,
  FlagOutlineSvg,
  TelescopeSvg,
} from "@daodao/assets";
import { useLocale, useTranslations } from "@daodao/i18n";
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

interface BrewingCardProps {
  id: string;
  title: string;
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
  batchReactionData?: BatchReactionItem;
  onReactionMutate?: () => void;
}

type ShowcaseCommentUser = {
  id?: string;
  customId?: string | null;
};

function getUserIslandHref(user?: ShowcaseCommentUser | null) {
  const identifier = user?.customId || user?.id;
  return identifier ? `/users/${identifier}` : null;
}

export function BrewingCard({
  id,
  title,
  startDate,
  endDate,
  user,
  actionDescription,
  frequencyMinDays,
  frequencyMaxDays,
  sessionDurationMinutes,
  commentCount = 0,
  batchReactionData,
  onReactionMutate,
}: BrewingCardProps) {
  const t = useTranslations("app_product");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const startFmt = formatShowcaseDate(startDate);
  const endFmt = formatShowcaseDate(endDate);
  const statusInfo = getStatusConfig(TaskStatus.inProgress);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { open: openSheet, close: closeSheet } = useSheetManager();
  const { data: practiceData } = usePracticeById(id);
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
        toast.success(t("following_unfollowed"));
      } else {
        await followTarget({ targetType: "practice", targetId: id });
        toast.success(t("following_followed_practice"));
      }
    } catch {
      setIsFollowing(wasFollowing);
      toast.error(t("operation_failed_retry"));
    }
  };

  const handleOpenBrowseActivity = () => {
    setMenuOpen(false);
    const followers: IBrowseActivityFollower[] = reactionItems.map((item) => ({
      id: item.userId,
      name: item.name,
      photoURL: item.photoURL ?? undefined,
      time: formatRelativeTime(item.reactedAt, locale),
      reaction: item.reactionType as ReactionTypeType,
    }));
    openSheet({
      title: t("showcase_browse_activity"),
      content: (
        <BrowseActivityContent
          viewCount={practiceData?.data?.stats?.viewCount ?? 0}
          commentCount={
            practiceData?.data?.stats?.commentCount ?? commentsData?.data?.length ?? commentCount
          }
          followers={followers}
          onClose={() => closeSheet()}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  };

  const {
    selectedReactions,
    totalCount,
    displayReactions,
    handleToggle,
    reactionItems,
    firstReactorName,
  } = useCardReactions("practice", id, batchReactionData, onReactionMutate, {
    disableIndividualFetch: true,
  });

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: card click for navigation
    // biome-ignore lint/a11y/noStaticElementInteractions: card click for navigation
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8F8FF] cursor-pointer"
      onClick={() => router.push(`/practices/${id}`)}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={statusInfo.variant} size="sm" className="w-fit">
          {t(statusInfo.label)}
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
                <span>{commonT("report")}</span>
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
                <span>{isFollowing ? t("following_unfollow") : t("following_follow")}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleOpenBrowseActivity}
                className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
              >
                <ChartColumnIncreasingSvg className="size-5 shrink-0" />
                <span>{t("showcase_browse_activity")}</span>
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
                    <span className="text-text-dark/60 ml-0.5">{t("showcase_days_per_week")}</span>
                  </span>
                )}
                {sessionDurationMinutes && (
                  <span className="text-sm">
                    <span className="font-semibold text-logo-cyan">{sessionDurationMinutes}</span>
                    <span className="text-text-dark/60 ml-0.5">
                      {t("showcase_minutes_per_session")}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Brewing overlay placeholder */}
      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-[#F8F9FA] border border-dashed border-[#C1D0D8]">
        <span className="text-base">🍵</span>
        <p className="text-xs text-text-dark/60">{t("showcase_brewing_locked")}</p>
      </div>

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
          firstReactorName={firstReactorName}
        />

        <Link
          href={`/practices/${id}`}
          className="flex items-center gap-1.5 text-[#9FB5B8] hover:text-text-dark transition-colors"
        >
          <DialogOutlineSvg className="size-6" />
          {(() => {
            const count =
              practiceData?.data?.stats?.commentCount ?? commentsData?.data?.length ?? commentCount;
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
            {preview.map((comment) => {
              const commentUserName = comment.user?.name ?? commonT("anonymous");
              const commentUserIslandHref = getUserIslandHref(comment.user);
              const commentAvatar = (
                <Avatar className="size-6 shrink-0 mt-0.5">
                  {comment.user?.photoURL && (
                    <AvatarImage src={comment.user.photoURL} alt={commentUserName} />
                  )}
                  <AvatarFallback className="text-[10px] font-medium text-text-dark bg-[#E8FAF9]">
                    {commentUserName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              );

              return (
                <div key={comment.id} className="flex items-start gap-2">
                  {commentUserIslandHref ? (
                    <Link
                      href={commentUserIslandHref}
                      aria-label={t("showcase_user_island_aria", { userName: commentUserName })}
                      className="shrink-0"
                    >
                      {commentAvatar}
                    </Link>
                  ) : (
                    commentAvatar
                  )}
                  <div className="flex-1 min-w-0">
                    {commentUserIslandHref ? (
                      <Link
                        href={commentUserIslandHref}
                        className="text-xs font-semibold text-[#295E5C] mr-1.5 hover:underline"
                      >
                        {commentUserName}
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-[#295E5C] mr-1.5">
                        {commentUserName}
                      </span>
                    )}
                    <span className="text-xs text-text-dark line-clamp-1">{comment.content}</span>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#9FB5B8]">
                    {formatRelativeTime(comment.createdAt, locale)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
