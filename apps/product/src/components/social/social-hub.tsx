"use client";

import {
  useConnections,
  useIncomingConnectionRequests,
  useOutgoingConnectionRequests,
  useConnectionMutations,
  useFollowers,
  useFollowing,
  useFollowMutations,
  useCurrentUser,
} from "@daodao/api";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useState } from "react";

// ─────────────────────────────────────────────
// Connections Tab
// ─────────────────────────────────────────────

const ConnectionsTab = () => {
  const { data: incomingData, isLoading: loadingIncoming } = useIncomingConnectionRequests();
  const { data: outgoingData, isLoading: loadingOutgoing } = useOutgoingConnectionRequests();
  const { data: connectionsData, isLoading: loadingConnections } = useConnections();
  const { accept, ignore, withdraw, disconnect } = useConnectionMutations();
  const { openWarningDialog } = useDialog();

  const isLoading = loadingIncoming || loadingOutgoing || loadingConnections;

  const incomingRequests = incomingData?.data ?? [];
  const outgoingRequests = outgoingData?.data ?? [];
  const connections = connectionsData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 text-[#9FB5B8] text-sm">
        載入中...
      </div>
    );
  }

  const handleAccept = async (requestId: string, name: string) => {
    try {
      await accept(requestId);
      toast.success(`已與 ${name} 成為夥伴`);
    } catch {
      toast.error("操作失敗，請稍後再試");
    }
  };

  const handleIgnore = async (requestId: string, name: string) => {
    const result = await openWarningDialog({
      title: "忽略連結請求？",
      message: `確定要忽略來自 ${name} 的連結請求嗎？`,
      textAlign: "left",
      buttons: [
        { label: "忽略", value: "confirm", variant: "outline" },
        { label: "先不要", value: "cancel", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    try {
      await ignore(requestId);
      toast.success("已忽略連結請求");
    } catch {
      toast.error("操作失敗，請稍後再試");
    }
  };

  const handleWithdraw = async (requestId: string, name: string) => {
    const result = await openWarningDialog({
      title: "撤回連結請求？",
      message: `確定要撤回發給 ${name} 的連結請求嗎？`,
      textAlign: "left",
      buttons: [
        { label: "撤回", value: "confirm", variant: "outline" },
        { label: "先不要", value: "cancel", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    try {
      await withdraw(requestId);
      toast.success("已撤回連結請求");
    } catch {
      toast.error("操作失敗，請稍後再試");
    }
  };

  const handleDisconnect = async (userId: string, name: string) => {
    const result = await openWarningDialog({
      title: "解除連結？",
      message: `解除連結後，你與 ${name} 將失去對彼此非公開內容的存取權。`,
      textAlign: "left",
      buttons: [
        { label: "解除連結", value: "confirm", variant: "outline" },
        { label: "先不要", value: "cancel", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    try {
      await disconnect(userId);
      toast.success(`已解除與 ${name} 的連結`);
    } catch {
      toast.error("操作失敗，請稍後再試");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 收到的請求 */}
      {incomingRequests.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium text-[#9FB5B8] px-1">收到的請求</h2>
          <div className="flex flex-col gap-2">
            {incomingRequests.map((req) => {
              const user = req.requester;
              const name = user?.name ?? "用戶";
              const userId = user?.id ?? req.requesterId;
              return (
                <div key={req.id} className="bg-white rounded-lg p-3 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={user?.photoURL} alt={name} />
                      <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                        {name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CustomLink
                        href={`/users/${user?.identifier ?? userId}`}
                        className="text-sm font-medium text-text-dark hover:underline"
                      >
                        {name}
                      </CustomLink>
                      {user?.bio && (
                        <p className="text-xs text-[#9FB5B8] truncate">{user.bio}</p>
                      )}
                    </div>
                  </div>

                  {req.intent && (
                    <p className="text-xs text-text-dark/70 bg-[#F7FAFA] rounded-lg px-3 py-2 leading-relaxed border border-[#E4EAE9]">
                      「{req.intent}」
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(req.id, name)}
                      className="flex-1 h-8 text-xs cursor-pointer bg-logo-cyan hover:bg-logo-cyan/90 text-white"
                    >
                      接受
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIgnore(req.id, name)}
                      className="flex-1 h-8 text-xs cursor-pointer"
                    >
                      忽略
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 發出的請求 */}
      {outgoingRequests.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium text-[#9FB5B8] px-1">發出的請求</h2>
          <div className="flex flex-col gap-2">
            {outgoingRequests.map((req) => {
              const user = req.receiver;
              const name = user?.name ?? "用戶";
              const userId = user?.id ?? req.receiverId;
              return (
                <div key={req.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={user?.photoURL} alt={name} />
                    <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                      {name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CustomLink
                      href={`/users/${user?.identifier ?? userId}`}
                      className="text-sm font-medium text-text-dark hover:underline"
                    >
                      {name}
                    </CustomLink>
                    <p className="text-xs text-[#9FB5B8]">等待對方回應</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWithdraw(req.id, name)}
                    className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                  >
                    撤回
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 我的夥伴 */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-[#9FB5B8] px-1">
          我的夥伴{connections.length > 0 && ` · ${connections.length} 人`}
        </h2>
        {connections.length === 0 ? (
          <div className="text-center py-12 text-[#9FB5B8] text-sm">
            尚未與任何人建立連結
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {connections.map((conn) => {
              const partner = conn.partner;
              const name = partner?.name ?? "用戶";
              const partnerId = partner?.id ?? conn.userAId;
              return (
                <div key={conn.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={partner?.photoURL} alt={name} />
                    <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                      {name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CustomLink
                      href={`/users/${partner?.identifier ?? partnerId}`}
                      className="text-sm font-medium text-text-dark hover:underline"
                    >
                      {name}
                    </CustomLink>
                    {partner?.bio && (
                      <p className="text-xs text-[#9FB5B8] truncate">{partner.bio}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(partnerId, name)}
                    className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                  >
                    解除連結
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────
// Following Tab
// ─────────────────────────────────────────────

const FollowingTab = () => {
  const [subTab, setSubTab] = useState<"users" | "practices">("users");
  const { data: currentUserData } = useCurrentUser();
  const userId = currentUserData?.user?.id ?? "";
  const { openWarningDialog } = useDialog();

  const { data: followingData, isLoading: loadingFollowing } = useFollowing({ userId });
  const { data: followersData, isLoading: loadingFollowers } = useFollowers({ userId });
  const { unfollow } = useFollowMutations(userId);

  const followingItems = followingData?.data ?? [];
  const followers = followersData?.data ?? [];
  const followedUsers = followingItems.filter((item) => item.targetType === "user" && item.user);
  const followedPractices = followingItems.filter(
    (item) => item.targetType === "practice" && item.practice
  );

  const handleUnfollow = async (targetType: "user" | "practice", targetId: string) => {
    const result = await openWarningDialog({
      title: "取消關注",
      description: "確定要取消關注嗎？",
      confirmLabel: "取消關注",
    });
    if (!result) return;
    try {
      await unfollow(targetType, targetId);
      toast.success("已取消關注");
    } catch {
      toast.error("操作失敗，請稍後再試");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 我關注的 section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium text-[#9FB5B8] px-1">我關注的</h2>

        {/* Sub-tab bar */}
        <div className="flex border-b border-[#E4EAE9]">
          {(["users", "practices"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSubTab(t)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer relative",
                subTab === t ? "text-logo-cyan" : "text-[#9FB5B8] hover:text-text-dark/60"
              )}
            >
              {t === "users" ? "使用者" : "實踐"}
              {subTab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
              )}
            </button>
          ))}
        </div>

        {loadingFollowing ? (
          <div className="flex justify-center py-8 text-[#9FB5B8] text-sm">載入中...</div>
        ) : subTab === "users" ? (
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
                      <CustomLink
                        href={`/users/${user.identifier ?? user.id}`}
                        className="text-sm font-medium text-text-dark hover:underline"
                      >
                        {user.name}
                      </CustomLink>
                      {user.bio && (
                        <p className="text-xs text-[#9FB5B8] truncate">{user.bio}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow("user", user.id)}
                      className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                    >
                      取消關注
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {followedPractices.length === 0 ? (
              <div className="text-center py-12 text-[#9FB5B8] text-sm">
                尚未關注任何實踐
              </div>
            ) : (
              followedPractices.map(({ practice }) => {
                if (!practice) return null;
                return (
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
                      onClick={() => handleUnfollow("practice", practice.id)}
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
      </section>

      {/* 關注我的 section */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-[#9FB5B8] px-1">
          關注我的{followers.length > 0 && ` · ${followers.length} 人`}
        </h2>
        {loadingFollowers ? (
          <div className="flex justify-center py-8 text-[#9FB5B8] text-sm">載入中...</div>
        ) : followers.length === 0 ? (
          <div className="text-center py-12 text-[#9FB5B8] text-sm">
            目前還沒有人關注你
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {followers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                    {user.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CustomLink
                    href={`/users/${user.identifier ?? user.id}`}
                    className="text-sm font-medium text-text-dark hover:underline"
                  >
                    {user.name}
                  </CustomLink>
                  {user.bio && (
                    <p className="text-xs text-[#9FB5B8] truncate">{user.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────
// Social Hub (top-level tab switcher)
// ─────────────────────────────────────────────

export const SocialHub = () => {
  const [tab, setTab] = useState<"connections" | "following">("connections");

  return (
    <div className="flex flex-col gap-4">
      {/* Main tab bar */}
      <div className="flex border-b border-[#E4EAE9]">
        {(["connections", "following"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer relative",
              tab === t ? "text-logo-cyan" : "text-[#9FB5B8] hover:text-text-dark/60"
            )}
          >
            {t === "connections" ? "連結" : "關注"}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
            )}
          </button>
        ))}
      </div>

      {tab === "connections" ? <ConnectionsTab /> : <FollowingTab />}
    </div>
  );
};
