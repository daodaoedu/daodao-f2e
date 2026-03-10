"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_FOLLOWED_USERS = [
  {
    id: "u1",
    name: "Sarah Chen",
    photoURL: "https://i.pravatar.cc/40?img=5",
    description: "UX Designer · 島島阿學",
  },
  {
    id: "u2",
    name: "Alex Wang",
    photoURL: "https://i.pravatar.cc/40?img=12",
    description: "工程師 · 自學程式",
  },
  {
    id: "u3",
    name: "Jordan Lee",
    photoURL: "https://i.pravatar.cc/40?img=33",
    description: "設計師 · 獨立接案",
  },
];

const MOCK_FOLLOWED_PRACTICES = [
  {
    id: "p1",
    title: "每天閱讀 30 分鐘",
    ownerName: "Sarah Chen",
    ownerPhotoURL: "https://i.pravatar.cc/40?img=5",
  },
  {
    id: "p2",
    title: "練習寫小說",
    ownerName: "Vincent",
    ownerPhotoURL: undefined,
  },
  {
    id: "p3",
    title: "每日冥想 10 分鐘",
    ownerName: "Jordan Lee",
    ownerPhotoURL: "https://i.pravatar.cc/40?img=33",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export const FollowingSettings = () => {
  const [tab, setTab] = useState<"users" | "practices">("users");
  const [followedUsers, setFollowedUsers] = useState(MOCK_FOLLOWED_USERS);
  const [followedPractices, setFollowedPractices] = useState(MOCK_FOLLOWED_PRACTICES);

  const handleUnfollowUser = (id: string) => {
    setFollowedUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("已取消關注");
  };

  const handleUnfollowPractice = (id: string) => {
    setFollowedPractices((prev) => prev.filter((p) => p.id !== id));
    toast.success("已取消關注");
  };

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

      {/* 追蹤的使用者 */}
      {tab === "users" && (
        <div className="flex flex-col gap-2">
          {followedUsers.length === 0 ? (
            <div className="text-center py-12 text-[#9FB5B8] text-sm">
              尚未關注任何使用者
            </div>
          ) : (
            followedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 bg-white rounded-lg p-3"
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                    {user.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CustomLink href={`/users/${user.id}`} className="text-sm font-medium text-text-dark hover:underline">
                    {user.name}
                  </CustomLink>
                  <p className="text-xs text-[#9FB5B8] truncate">{user.description}</p>
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
            ))
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
            followedPractices.map((practice) => (
              <div
                key={practice.id}
                className="flex items-center gap-3 bg-white rounded-lg p-3"
              >
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
            ))
          )}
        </div>
      )}
    </div>
  );
};
