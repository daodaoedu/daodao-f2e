"use client";

import { followTarget, unfollowTarget, useFollowStatus } from "@daodao/api";
import { ChartColumnIncreasingSvg, DialogOutlineSvg, TelescopeSvg } from "@daodao/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import { LottieEmoji } from "@/components/check-in/reactions/lottie-emoji";
import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";

export interface IBrowseActivityFollower {
  id: string;
  name: string;
  time: string;
  photoURL?: string;
  reaction: ReactionTypeType;
}

interface BrowseActivityContentProps {
  viewCount: number;
  commentCount: number;
  followers: IBrowseActivityFollower[];
}

function FollowerRow({ follower }: { follower: IBrowseActivityFollower }) {
  const { data: followStatusData } = useFollowStatus("user", follower.id);
  const [localOverride, setLocalOverride] = useState<boolean | null>(null);
  const isFollowing = localOverride ?? followStatusData?.data?.isFollowing ?? false;

  const handleToggle = async () => {
    setLocalOverride(!isFollowing);
    try {
      if (isFollowing) {
        await unfollowTarget("user", follower.id);
      } else {
        await followTarget({ targetType: "user", targetId: follower.id });
      }
    } catch {
      setLocalOverride(isFollowing);
    }
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative shrink-0">
        <Avatar className="size-10">
          {follower.photoURL && <AvatarImage src={follower.photoURL} alt={follower.name} />}
          <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
            {follower.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-white ring-1 ring-white flex items-center justify-center">
          <LottieEmoji
            url={REACTION_CONFIG[follower.reaction].lottieUrl}
            fallback={REACTION_CONFIG[follower.reaction].emoji}
            size={14}
            play={false}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#295E5C]">{follower.name}</p>
        <p className="text-xs text-[#9FB5B8]">{follower.time}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={handleToggle}
        className={cn(
          "shrink-0 h-auto text-sm font-medium px-4 py-1.5 rounded-full transition-colors",
          isFollowing
            ? "border border-[#E4EAE9] text-[#295E5C] hover:bg-[#F0F9F8]"
            : "bg-logo-cyan text-white hover:bg-logo-cyan/80"
        )}
      >
        {isFollowing ? "取消關注" : "+ 關注"}
      </Button>
    </div>
  );
}

export function BrowseActivityContent({
  viewCount,
  commentCount,
  followers,
}: BrowseActivityContentProps) {
  const [tab, setTab] = useState<"data" | "echo">("data");
  const [reactionFilter, setReactionFilter] = useState<"all" | ReactionTypeType>("all");

  const reactionCounts = followers.reduce<Record<string, number>>((acc, follower) => {
    acc[follower.reaction] = (acc[follower.reaction] || 0) + 1;
    return acc;
  }, {});
  const uniqueReactions = [...new Set(followers.map((f) => f.reaction))] as ReactionTypeType[];
  const filteredFollowers =
    reactionFilter === "all" ? followers : followers.filter((f) => f.reaction === reactionFilter);


  return (
    <div className="flex flex-col">
      <div className="flex border-b border-[#E4EAE9] mx-4">
        {(["data", "echo"] as const).map((currentTab) => (
          <Button
            key={currentTab}
            type="button"
            variant="ghost"
            onClick={() => setTab(currentTab)}
            className={cn(
              "flex-1 h-auto py-3 text-sm font-medium transition-colors relative",
              tab === currentTab ? "text-logo-cyan" : "text-[#9FB5B8]"
            )}
          >
            {currentTab === "data" ? "數據" : "迴響"}
            {tab === currentTab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
            )}
          </Button>
        ))}
      </div>

      {tab === "data" && (
        <div className="flex flex-col divide-y divide-[#E4EAE9] px-4 mt-2">
          {[
            { icon: <TelescopeSvg className="size-5" />, label: "瀏覽", count: viewCount },
            { icon: <DialogOutlineSvg className="size-5" />, label: "留言", count: commentCount },
            {
              icon: <ChartColumnIncreasingSvg className="size-5" />,
              label: "迴響",
              count: followers.length,
            },
          ].map(({ icon, label, count }) => (
            <div key={label} className="flex items-center gap-3 py-4 text-[#295E5C]">
              <span className="text-[#9FB5B8]">{icon}</span>
              <span className="flex-1 text-sm">{label}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "echo" && (
        <div className="flex flex-col">
          {followers.length > 0 && (
            <div className="flex overflow-x-auto border-b border-[#E4EAE9] mx-4 mt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setReactionFilter("all")}
                className={cn(
                  "shrink-0 h-auto flex items-center gap-1 px-3 py-2.5 text-sm font-medium relative whitespace-nowrap",
                  reactionFilter === "all" ? "text-logo-cyan" : "text-[#9FB5B8]"
                )}
              >
                全部 {followers.length}
                {reactionFilter === "all" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
                )}
              </Button>
              {uniqueReactions.map((reaction) => {
                const config = REACTION_CONFIG[reaction];
                const count = reactionCounts[reaction] || 0;
                const isActive = reactionFilter === reaction;
                return (
                  <Button
                    key={reaction}
                    type="button"
                    variant="ghost"
                    onClick={() => setReactionFilter(reaction)}
                    className={cn(
                      "shrink-0 h-auto flex items-center gap-1 px-3 py-2.5 text-sm font-medium relative whitespace-nowrap",
                      isActive ? "text-logo-cyan" : "text-[#9FB5B8]"
                    )}
                  >
                    <LottieEmoji
                      url={config.lottieUrl}
                      fallback={config.emoji}
                      size={18}
                      play={false}
                    />
                    {count}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
                    )}
                  </Button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-1 px-4 mt-2">
            {filteredFollowers.length > 0 ? (
              filteredFollowers.map((follower) => (
                <FollowerRow key={follower.id} follower={follower} />
              ))
            ) : (
              <div className="py-6 text-center text-sm text-[#9FB5B8]">目前還沒有互動紀錄</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
