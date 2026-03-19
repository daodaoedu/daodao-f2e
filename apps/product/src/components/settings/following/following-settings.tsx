"use client";

import { useCurrentUser, useFollowMutations, useFollowing } from "@daodao/api";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";

export const FollowingSettings = () => {
  const [tab, setTab] = useState<"users" | "practices">("users");
  const { data: currentUserData } = useCurrentUser();
  const userId = currentUserData?.data?.id ?? "";

  const { data: followingData, isLoading } = useFollowing({ userId });
  const { unfollow } = useFollowMutations(userId);

  const followingItems = followingData?.data ?? [];
  const followedUsers = followingItems.filter((item) => item.targetType === "user" && item.user);
  const followedPractices = followingItems.filter((item) => item.targetType === "practice" && item.practice);

  const handleUnfollowUser = async (targetId: string) => {
    try {
      await unfollow("user", targetId);
      toast.success("已取消關注");
    } catch {
      toast.error("操作失敗，請稍後再試");
    }
  };

  const handleUnfollowPractice = async (targetId: string) => {
    try {
      await unfollow("practice", targetId);
      toast.success("已取消關注");
    } catch {
      toast.error("操作失敗，請稍後再試");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 text-[#9FB5B8] text-sm">
        載入中...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Bar */}
      <div className="flex border-b border-[#E4EAE9]">
        {(["users", "practices"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer relative",
              tab === t ? "text-logo-cyan" : "text-[#9FB5B8] hover:text-text-dark/60"
            )}
          >
            {t === "users" ? "關注的使用者" : "關注的實踐"}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 關注的使用者 */}
      {tab === "users" && (
        <div className="flex flex-col gap-2">
          {followedUsers.length === 0 ? (
            <div className="text-center py-12 text-[#9FB5B8] text-sm">
              尚未關注任何使用者
            </div>
          ) : (
            followedUsers.map(({ user }) => {
              if (!user) return null;
              return (
                <div key={user.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={user.photoURL} alt={user.name} />
                    <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                      {user.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CustomLink href={`/users/${user.identifier ?? user.id}`} className="text-sm font-medium text-text-dark hover:underline">
                      {user.name}
                    </CustomLink>
                    {user.bio && (
                      <p className="text-xs text-[#9FB5B8] truncate">{user.bio}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnfollowUser(user.id)}
                    className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                  >
                    取消關注
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 關注的實踐 */}
      {tab === "practices" && (
        <div className="flex flex-col gap-2">
          {followedPractices.length === 0 ? (
            <div className="text-center py-12 text-[#9FB5B8] text-sm">
              尚未關注任何實踐
            </div>
          ) : (
            followedPractices.map(({ practice }) => {
              if (!practice) return null;
              return (
                <div key={practice.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={practice.ownerPhotoURL} alt={practice.ownerName} />
                    <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                      {practice.ownerName.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CustomLink href={`/practices/${practice.id}`} className="text-sm font-medium text-text-dark hover:underline line-clamp-1">
                      {practice.title}
                    </CustomLink>
                    <p className="text-xs text-[#9FB5B8]">{practice.ownerName}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnfollowPractice(practice.id)}
                    className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                  >
                    取消關注
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
