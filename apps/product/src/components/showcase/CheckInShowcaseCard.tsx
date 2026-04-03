"use client";

import type { IShowcaseCheckIn, ReactionTypeValue } from "@daodao/api";
import { removeReaction, upsertReaction, useReactions } from "@daodao/api";
import { DialogOutlineSvg } from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { MapPin, Pencil } from "lucide-react";
import { useCallback, useTransition } from "react";
import { ReactionPickerButton } from "@/components/check-in/reactions";
import type { ApiMoodType } from "@/constants/mood";
import { MOOD_OPTIONS, mapApiMoodToMoodType } from "@/constants/mood";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { formatRelativeTime } from "@/utils/format-time";

export function CheckInShowcaseCard(props: IShowcaseCheckIn) {
  const {
    id,
    checkin_date,
    mood,
    note,
    tags,
    image_urls,
    practice,
    user,
    comment_count,
    comment_preview,
  } = props;

  const router = useRouter();
  const frontendMood = mapApiMoodToMoodType(mood as ApiMoodType);
  const moodOption = frontendMood ? MOOD_OPTIONS.find((m) => m.id === frontendMood) : null;

  // --- Reaction state (same pattern as PracticeShowcaseCard) ---
  const { data: reactionsData, mutate } = useReactions({
    targetType: "checkin",
    targetId: id,
  });
  const [, startTransition] = useTransition();

  const currentUserReaction = (reactionsData?.data?.currentUserReaction ??
    null) as ReactionTypeType | null;
  const selectedReactions: ReactionTypeType[] = currentUserReaction ? [currentUserReaction] : [];
  const allReactions = reactionsData?.data?.reactions ?? [];
  const totalCount = allReactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactions = allReactions
    .filter((r) => r.count > 0)
    .map((r) => r.type as ReactionTypeType);

  const handleToggle = useCallback(
    (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      startTransition(async () => {
        if (isSelected) {
          await removeReaction({ targetType: "checkin", targetId: id });
        } else {
          await upsertReaction({
            targetType: "checkin",
            targetId: id,
            reactionType: type as ReactionTypeValue,
          });
        }
        await mutate();
      });
    },
    [currentUserReaction, id, mutate]
  );

  const handleCardClick = () => {
    router.push(`/practices/${practice.id}/check-ins/${id}`);
  };

  const handlePracticeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/practices/${practice.id}`);
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: card click for navigation
    // biome-ignore lint/a11y/noStaticElementInteractions: card click for navigation
    <div
      className="rounded-2xl bg-white p-4 shadow-sm border border-logo-orange/15 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* 1. Header: badge + mood */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-logo-orange/10 text-logo-orange text-xs font-medium">
            <Pencil className="size-3" />
            打卡
          </span>
          <span className="text-xs text-text-dark/50">{checkin_date}</span>
        </div>
        {moodOption && (
          <div className="flex items-center justify-center size-7 rounded-full bg-logo-orange/10">
            <moodOption.emoji className="size-4" />
          </div>
        )}
      </div>

      {/* 2. 實踐追溯連結 */}
      <button
        type="button"
        className="flex items-center gap-1 text-sm text-logo-cyan underline mb-2"
        onClick={handlePracticeClick}
      >
        <MapPin className="size-3.5" />
        {practice.title} ›
      </button>

      {/* 3. 用戶 + 內容 */}
      {user && (
        <div className="flex gap-2 mb-2">
          <Avatar className="size-8 shrink-0">
            {user.photo_url && <AvatarImage src={user.photo_url} alt={user.name} />}
            <AvatarFallback className="text-[10px] font-medium text-text-dark bg-[#E8FAF9]">
              {(user.name ?? "?").slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-dark">{user.name}</p>
            <p className="text-sm text-text-dark line-clamp-2 whitespace-pre-wrap">{note}</p>
          </div>
        </div>
      )}

      {/* 4. 圖片縮圖 */}
      {image_urls?.length > 0 && (
        <div className="flex gap-2 mb-2">
          {image_urls.slice(0, 3).map((url) => (
            <div key={url} className="size-16 rounded-lg bg-logo-orange/6 overflow-hidden">
              <img src={url} alt="" className="size-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* 5. Tags */}
      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-primary-lightest text-logo-cyan"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 6. Reaction bar */}
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
        />

        <div className="flex items-center gap-1.5 text-[#9FB5B8]">
          <DialogOutlineSvg className="size-6" />
          {(comment_count ?? 0) > 0 && <span className="text-sm font-medium">{comment_count}</span>}
        </div>
      </div>

      {/* 7. 留言預覽 */}
      {comment_preview && comment_preview.length > 0 && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: stop card click
        // biome-ignore lint/a11y/noStaticElementInteractions: stop card click
        <div
          className="mt-3 flex flex-col gap-2 border-t border-[#E4EAE9] pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          {comment_preview.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <Avatar className="size-6 shrink-0 mt-0.5">
                {comment.user?.photo_url && (
                  <AvatarImage src={comment.user.photo_url} alt={comment.user.name} />
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
                <span className="ml-1 text-[10px] text-[#9FB5B8]">
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
