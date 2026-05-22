"use client";

import { useCurrentUser, useFollowing, useFollowMutations } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";

export const FollowingSettings = () => {
  const t = useTranslations("app_product");
  const [tab, setTab] = useState<"users" | "practices">("users");
  const { data: currentUserData } = useCurrentUser();
  const userId = currentUserData?.data?.id ?? "";

  const { data: followingData, isLoading } = useFollowing({ userId });
  const { unfollow } = useFollowMutations(userId);

  const followingItems = followingData?.data ?? [];
  const followedUsers = followingItems.filter((item) => item.targetType === "user" && item.user);
  const followedPractices = followingItems.filter(
    (item) => item.targetType === "practice" && item.practice
  );

  const handleUnfollowUser = async (targetId: string) => {
    try {
      await unfollow("user", targetId);
      toast.success(t("following_unfollowed"));
    } catch {
      toast.error(t("operation_failed_retry"));
    }
  };

  const handleUnfollowPractice = async (targetId: string) => {
    try {
      await unfollow("practice", targetId);
      toast.success(t("following_unfollowed"));
    } catch {
      toast.error(t("operation_failed_retry"));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-16 text-[#9FB5B8] text-sm">{t("loading")}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Bar */}
      <div className="flex border-b border-[#E4EAE9]">
        {(["users", "practices"] as const).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer relative",
              tab === tabKey ? "text-logo-cyan" : "text-[#9FB5B8] hover:text-text-dark/60"
            )}
          >
            {tabKey === "users" ? t("following_users_tab") : t("following_practices_tab")}
            {tab === tabKey && (
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
              {t("following_empty_users")}
            </div>
          ) : (
            followedUsers.map(({ user }) => {
              if (!user) return null;
              return (
                <div key={user.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                  <CustomLink href={`/users/${user.identifier ?? user.id}`} className="shrink-0">
                    <Avatar className="size-10">
                      <AvatarImage src={user.photoURL} alt={user.name} />
                      <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                        {user.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  </CustomLink>
                  <div className="flex-1 min-w-0">
                    <CustomLink
                      href={`/users/${user.identifier ?? user.id}`}
                      className="text-sm font-medium text-text-dark hover:underline"
                    >
                      {user.name}
                    </CustomLink>
                    {user.bio && <p className="text-xs text-[#9FB5B8] truncate">{user.bio}</p>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnfollowUser(user.id)}
                    className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                  >
                    {t("following_unfollow")}
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
              {t("following_empty_practices")}
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
                    <CustomLink
                      href={`/practices/${practice.id}`}
                      className="text-sm font-medium text-text-dark hover:underline line-clamp-1"
                    >
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
                    {t("following_unfollow")}
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
