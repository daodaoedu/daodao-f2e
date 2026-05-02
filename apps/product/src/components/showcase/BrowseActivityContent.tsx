"use client";

import { useReactionsList } from "@daodao/api";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { LottieEmoji } from "@/components/check-in/reactions/lottie-emoji";
import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";
import { formatRelativeTime } from "@/utils/format-time";

interface BrowseActivityContentProps {
  targetId: string;
}

export function BrowseActivityContent({ targetId }: BrowseActivityContentProps) {
  const { data } = useReactionsList({
    targetType: "checkin",
    targetId,
  });

  const items = [...(data?.data?.items ?? [])]
    .filter((item) => item.isPublic || item.isConnection)
    .sort((a, b) => new Date(b.reactedAt).getTime() - new Date(a.reactedAt).getTime());

  if (items.length === 0) {
    return <div className="py-8 text-center text-sm text-[#9FB5B8]">還沒有人表達反應</div>;
  }

  return (
    <div className="flex flex-col gap-1 px-4">
      {items.map((item) => {
        const config = REACTION_CONFIG[item.reactionType as ReactionTypeType];
        return (
          <div key={`${item.userId}-${item.reactedAt}`} className="flex items-center gap-3 py-2">
            <Avatar className="size-8 shrink-0">
              {item.photoURL && <AvatarImage src={item.photoURL} alt={item.name} />}
              <AvatarFallback className="text-[10px] font-medium text-text-dark bg-primary-palest">
                {item.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#295E5C] truncate">{item.name}</p>
              <p className="text-xs text-[#9FB5B8]">{formatRelativeTime(item.reactedAt)}</p>
            </div>
            {config && (
              <LottieEmoji url={config.lottieUrl} fallback={config.emoji} size={20} play={false} />
            )}
          </div>
        );
      })}
    </div>
  );
}
