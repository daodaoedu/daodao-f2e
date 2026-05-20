"use client";

import {
  useConnectionMutations,
  useConnections,
  useCurrentUser,
  useFollowers,
  useFollowing,
  useFollowMutations,
  useIncomingConnectionRequests,
  useOutgoingConnectionRequests,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";

// ─────────────────────────────────────────────
// Connections Tab
// ─────────────────────────────────────────────

const ConnectionsTab = () => {
  const t = useTranslations("social");
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
    return <div className="flex justify-center py-16 text-[#9FB5B8] text-sm">{t("loading")}</div>;
  }

  const handleAccept = async (requestId: string, name: string) => {
    try {
      await accept(requestId);
      toast.success(t("conn_accept_success", { name }));
    } catch {
      toast.error(t("operation_failed"));
    }
  };

  const handleIgnore = async (requestId: string, name: string) => {
    const result = await openWarningDialog({
      title: t("conn_ignore_title"),
      message: t("conn_ignore_message", { name }),
      textAlign: "left",
      buttons: [
        { label: t("conn_ignore_confirm"), value: "confirm", variant: "outline" },
        { label: t("conn_cancel_btn"), value: "cancel", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    try {
      await ignore(requestId);
      toast.success(t("conn_ignore_success"));
    } catch {
      toast.error(t("operation_failed"));
    }
  };

  const handleWithdraw = async (requestId: string, name: string) => {
    const result = await openWarningDialog({
      title: t("conn_withdraw_title"),
      message: t("conn_withdraw_message", { name }),
      textAlign: "left",
      buttons: [
        { label: t("conn_withdraw_confirm"), value: "confirm", variant: "outline" },
        { label: t("conn_cancel_btn"), value: "cancel", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    try {
      await withdraw(requestId);
      toast.success(t("conn_withdraw_success"));
    } catch {
      toast.error(t("operation_failed"));
    }
  };

  const handleDisconnect = async (userId: string, name: string) => {
    const result = await openWarningDialog({
      title: t("conn_disconnect_title"),
      message: t("conn_disconnect_message", { name }),
      textAlign: "left",
      buttons: [
        { label: t("conn_disconnect_confirm"), value: "confirm", variant: "outline" },
        { label: t("conn_cancel_btn"), value: "cancel", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    try {
      await disconnect(userId);
      toast.success(t("conn_disconnect_success", { name }));
    } catch {
      toast.error(t("operation_failed"));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 收到的請求 */}
      {incomingRequests.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium text-[#9FB5B8] px-1">{t("conn_incoming_section")}</h2>
          <div className="flex flex-col gap-2">
            {incomingRequests.map((req) => {
              const name = req.requesterNickname ?? t("default_user");
              return (
                <div key={req.requestId} className="bg-white rounded-lg p-3 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={req.requesterPhotoUrl ?? undefined} alt={name} />
                      <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                        {name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CustomLink
                        href={`/users/${req.requesterExternalId}`}
                        className="text-sm font-medium text-text-dark hover:underline"
                      >
                        {name}
                      </CustomLink>
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
                      onClick={() => handleAccept(String(req.requestId), name)}
                      className="flex-1 h-8 text-xs cursor-pointer bg-logo-cyan hover:bg-logo-cyan/90 text-white"
                    >
                      {t("conn_accept_btn")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIgnore(String(req.requestId), name)}
                      className="flex-1 h-8 text-xs cursor-pointer"
                    >
                      {t("conn_ignore_confirm")}
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
          <h2 className="text-xs font-medium text-[#9FB5B8] px-1">{t("conn_outgoing_section")}</h2>
          <div className="flex flex-col gap-2">
            {outgoingRequests.map((req) => {
              const name = req.receiverNickname ?? t("default_user");
              return (
                <div
                  key={req.requestId}
                  className="bg-white rounded-lg p-3 flex items-center gap-3"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={req.receiverPhotoUrl ?? undefined} alt={name} />
                    <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                      {name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CustomLink
                      href={`/users/${req.receiverExternalId}`}
                      className="text-sm font-medium text-text-dark hover:underline"
                    >
                      {name}
                    </CustomLink>
                    <p className="text-xs text-[#9FB5B8]">{t("conn_waiting_response")}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWithdraw(String(req.requestId), name)}
                    className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                  >
                    {t("conn_withdraw_confirm")}
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
          {t("conn_partners_section")}{connections.length > 0 && ` · ${connections.length} ${t("conn_people_count")}`}
        </h2>
        {connections.length === 0 ? (
          <div className="text-center py-12 text-[#9FB5B8] text-sm">{t("conn_empty")}</div>
        ) : (
          <div className="flex flex-col gap-2">
            {connections.map((conn) => {
              const name = conn.nickname ?? t("default_user");
              return (
                <div
                  key={conn.connectionId}
                  className="bg-white rounded-lg p-3 flex items-center gap-3"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={conn.photoUrl ?? undefined} alt={name} />
                    <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                      {name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CustomLink
                      href={`/users/${conn.externalId}`}
                      className="text-sm font-medium text-text-dark hover:underline"
                    >
                      {name}
                    </CustomLink>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(conn.externalId, name)}
                    className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                  >
                    {t("conn_disconnect_confirm")}
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
  const t = useTranslations("social");
  const [subTab, setSubTab] = useState<"users" | "practices">("users");
  const { data: currentUserData } = useCurrentUser();
  const userId = currentUserData?.data?.id ?? "";
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
      title: t("follow_unfollow_title"),
      message: t("follow_unfollow_message"),
    });
    if (!result) return;
    try {
      await unfollow(targetType, targetId);
      toast.success(t("follow_unfollow_success"));
    } catch {
      toast.error(t("operation_failed"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 我關注的 section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium text-[#9FB5B8] px-1">{t("follow_following_section")}</h2>

        {/* Sub-tab bar */}
        <div className="flex border-b border-[#E4EAE9]">
          {(["users", "practices"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSubTab(tab)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer relative",
                subTab === tab ? "text-logo-cyan" : "text-[#9FB5B8] hover:text-text-dark/60"
              )}
            >
              {tab === "users" ? t("follow_subtab_users") : t("follow_subtab_practices")}
              {subTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
              )}
            </button>
          ))}
        </div>

        {loadingFollowing ? (
          <div className="flex justify-center py-8 text-[#9FB5B8] text-sm">{t("loading")}</div>
        ) : subTab === "users" ? (
          <div className="flex flex-col gap-2">
            {followedUsers.length === 0 ? (
              <div className="text-center py-12 text-[#9FB5B8] text-sm">{t("follow_no_users")}</div>
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
                      {user.bio && <p className="text-xs text-[#9FB5B8] truncate">{user.bio}</p>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow("user", user.id)}
                      className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                    >
                      {t("follow_unfollow_btn")}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {followedPractices.length === 0 ? (
              <div className="text-center py-12 text-[#9FB5B8] text-sm">{t("follow_no_practices")}</div>
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
                      {t("follow_unfollow_btn")}
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
          {t("follow_followers_section")}{followers.length > 0 && ` · ${followers.length} ${t("conn_people_count")}`}
        </h2>
        {loadingFollowers ? (
          <div className="flex justify-center py-8 text-[#9FB5B8] text-sm">{t("loading")}</div>
        ) : followers.length === 0 ? (
          <div className="text-center py-12 text-[#9FB5B8] text-sm">{t("follow_no_followers")}</div>
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
                  {user.bio && <p className="text-xs text-[#9FB5B8] truncate">{user.bio}</p>}
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
  const t = useTranslations("social");
  const [tab, setTab] = useState<"connections" | "following">("connections");

  return (
    <div className="flex flex-col gap-4">
      {/* Main tab bar */}
      <div className="flex border-b border-[#E4EAE9]">
        {(["connections", "following"] as const).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer relative",
              tab === tabKey ? "text-logo-cyan" : "text-[#9FB5B8] hover:text-text-dark/60"
            )}
          >
            {tabKey === "connections" ? t("tab_connections") : t("tab_following")}
            {tab === tabKey && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
            )}
          </button>
        ))}
      </div>

      {tab === "connections" ? <ConnectionsTab /> : <FollowingTab />}
    </div>
  );
};
