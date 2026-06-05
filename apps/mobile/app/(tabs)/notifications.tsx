import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { NotificationType } from "@/constants/notification-type";
import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";
import { colors } from "@/generated/design-tokens";
import {
  type INotificationApiItem,
  markAllNotificationsRead,
  markNotificationRead,
  respondConnectionRequest,
  revalidateAllNotifications,
  useNotifications,
} from "@/hooks/useNotifications";
import { useMobileTranslation } from "@/i18n";
import { formatRelativeTime } from "@/utils/format-time";

// ============================================================================
// Helpers
// ============================================================================

const BACKEND_TYPE_MAP: Record<string, string> = {
  UserFollowed: NotificationType.followUser,
  PracticeFollowed: NotificationType.followPractice,
  Connect: NotificationType.connect,
  ConnectAccepted: NotificationType.agreeConnect,
  PracticeCheckinActivity: NotificationType.updatePracticeCheckin,
  PartnerCheckinActivity: NotificationType.updatePracticeCheckin,
  PracticeCreated: NotificationType.practiceCreated,
};

function normalizeType(backendType: string): string {
  return BACKEND_TYPE_MAP[backendType] ?? backendType;
}

const AVATAR_COLORS = [
  "#FFD6C8",
  "#C8FFE4",
  "#C8DCFF",
  "#FFC8F0",
  "#FEFFC8",
  "#C8FFF2",
  "#E4C8FF",
  "#FFE4C8",
  "#C8F0FF",
];

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? "#C8FFF2";
}

function getReactionEmoji(reactionType: string | undefined): string {
  if (!reactionType) return "🙌";
  return REACTION_CONFIG[reactionType as ReactionTypeType]?.emoji ?? "🙌";
}

function getNotificationText(
  item: INotificationApiItem,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const type = normalizeType(item.type);
  const name = item.actor.name;
  const count = item.aggregationCount ?? 1;
  const suffix = count > 1 ? t("and_others", { count: count - 1 }) : "";
  const practiceTitle = item.practiceTitle ?? "";

  switch (type) {
    case NotificationType.reaction:
      return t("text_reaction", {
        name,
        suffix,
        title: practiceTitle,
        reaction: getReactionEmoji(item.reactionType),
      });
    case NotificationType.comment:
      return t("text_comment", { name, title: practiceTitle, content: item.content ?? "" });
    case NotificationType.followUser:
      return t("text_follow_user", { name });
    case NotificationType.followPractice:
      return t("text_follow_practice", { name, title: practiceTitle });
    case NotificationType.connect:
      return t("text_connect", { name });
    case NotificationType.agreeConnect:
      return t("text_agree_connect", { name });
    case NotificationType.connectAgree:
      return t("text_connect_agree", { name });
    case NotificationType.connectRejected:
      return t("text_connect_rejected", { name });
    case NotificationType.updatePracticeCheckin:
      return t("text_check_in", {
        name,
        title: practiceTitle,
        content: item.content ? t("content_suffix", { content: item.content }) : "",
      });
    case NotificationType.updatePracticeFinish:
      return t("text_finish_practice", { name, title: practiceTitle });
    case NotificationType.practiceCreated:
      return t("text_practice_created", { name, title: practiceTitle });
    default:
      return t("text_default", { name });
  }
}

function getNotificationHref(item: INotificationApiItem): string | null {
  const practiceId = item.practiceId ?? (item.entityType === "checkin" ? undefined : item.entityId);

  switch (item.entityType) {
    case "practice":
    case "comment":
    case "checkin":
    case "buddy_request":
      if (practiceId && item.checkinId) {
        return `/practices/${practiceId}/check-ins/${item.checkinId}`;
      }
      return practiceId ? `/practices/${practiceId}` : null;
    case "user":
    case "connection":
      return item.actor.id ? `/users/${item.actor.id}` : null;
    default:
      return null;
  }
}

// ============================================================================
// Notification Item
// ============================================================================

function NotificationRow({
  item,
  onPress,
  onAcceptConnect,
  onRejectConnect,
}: {
  item: INotificationApiItem;
  onPress: (item: INotificationApiItem) => void;
  onAcceptConnect: (item: INotificationApiItem) => void;
  onRejectConnect: (item: INotificationApiItem) => void;
}) {
  const t = useMobileTranslation("mobile.notifications");
  const type = normalizeType(item.type);
  const isConnect = type === NotificationType.connect;

  return (
    <Pressable onPress={() => onPress(item)}>
      <XStack
        padding="$3"
        gap="$3"
        alignItems="center"
        backgroundColor={item.isRead ? "$background" : "#F0FAFB"}
        borderRadius="$md"
      >
        {/* 未讀橘點 */}
        {!item.isRead && (
          <YStack
            position="absolute"
            left={8}
            top={12}
            width={6}
            height={6}
            borderRadius={3}
            backgroundColor="#FF6E0B"
          />
        )}

        {/* 頭像 */}
        <Avatar circular size="$5">
          {item.actor.photoURL ? <Avatar.Image src={item.actor.photoURL} /> : null}
          <Avatar.Fallback backgroundColor={getAvatarColor(item.actor.name)}>
            <Text fontSize={16} fontWeight="600" color="$color">
              {item.actor.name.slice(0, 1)}
            </Text>
          </Avatar.Fallback>
        </Avatar>

        {/* 文字 */}
        <YStack flex={1} gap="$1">
          <Text fontSize={14} color="$color" numberOfLines={2}>
            {getNotificationText(item, t)}
          </Text>
          {isConnect && item.connectMessage && (
            <Text
              fontSize={13}
              color="$color"
              opacity={0.7}
              backgroundColor="#F2F7F7"
              borderRadius="$sm"
              paddingHorizontal="$2"
              paddingVertical="$1"
              numberOfLines={2}
            >
              「{item.connectMessage}」
            </Text>
          )}
          <Text fontSize={12} color="$color" opacity={0.5}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </YStack>

        {/* 連結請求操作按鈕 */}
        {isConnect && (
          <XStack gap="$2">
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onAcceptConnect(item);
              }}
              style={{
                backgroundColor: colors.primary.base,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text fontSize={13} fontWeight="600" color="white">
                {t("accept")}
              </Text>
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onRejectConnect(item);
              }}
              style={{
                backgroundColor: "#E4EAE9",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text fontSize={13} fontWeight="600" color="$color">
                {t("ignore")}
              </Text>
            </Pressable>
          </XStack>
        )}
      </XStack>
    </Pressable>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export default function NotificationsScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.notifications");
  const { notifications, unreadCount, isLoading, mutate } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<
    Record<number, Partial<INotificationApiItem>>
  >({});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  }, [mutate]);

  const handlePress = useCallback(
    async (item: INotificationApiItem) => {
      if (!item.isRead) {
        setLocalOverrides((prev) => ({
          ...prev,
          [item.id]: { ...(prev[item.id] ?? {}), isRead: true },
        }));
        markNotificationRead(item.id).catch(() => {});
        revalidateAllNotifications();
      }

      const href = getNotificationHref(item);
      if (href) {
        router.push(href as never);
      }
    },
    [router]
  );

  const handleAcceptConnect = useCallback(
    async (item: INotificationApiItem) => {
      if (!item.connectionRequestId) return;
      setLocalOverrides((prev) => ({
        ...prev,
        [item.id]: { ...(prev[item.id] ?? {}), type: NotificationType.connectAgree, isRead: true },
      }));
      try {
        await respondConnectionRequest(String(item.connectionRequestId), "accept");
        Alert.alert("", t("connect_accepted_toast", { name: item.actor.name }));
        revalidateAllNotifications();
      } catch {
        setLocalOverrides((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
        Alert.alert(t("error_title"), t("operation_failed"));
      }
    },
    [t]
  );

  const handleRejectConnect = useCallback(
    async (item: INotificationApiItem) => {
      if (!item.connectionRequestId) return;
      setLocalOverrides((prev) => ({
        ...prev,
        [item.id]: {
          ...(prev[item.id] ?? {}),
          type: NotificationType.connectRejected,
          isRead: true,
        },
      }));
      try {
        await respondConnectionRequest(String(item.connectionRequestId), "reject");
        revalidateAllNotifications();
      } catch {
        setLocalOverrides((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
        Alert.alert(t("error_title"), t("operation_failed"));
      }
    },
    [t]
  );

  const handleMarkAllRead = useCallback(async () => {
    await markAllNotificationsRead().catch(() => {});
    revalidateAllNotifications();
  }, []);

  const displayNotifications = notifications.map((notification) => ({
    ...notification,
    ...(localOverrides[notification.id] ?? {}),
  }));
  const unread = displayNotifications.filter((n) => !n.isRead);
  const read = displayNotifications.filter((n) => n.isRead);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack padding="$4" alignItems="center" justifyContent="space-between">
          <Text fontSize={22} fontWeight="700" color="$color">
            最新通知
          </Text>
          {unreadCount > 0 && (
            <Pressable onPress={handleMarkAllRead}>
              <Text fontSize={13} color={colors.primary.base}>
                全部標為已讀
              </Text>
            </Pressable>
          )}
        </XStack>

        {/* Content */}
        {isLoading && notifications.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner size="large" color={colors.primary.base} />
          </YStack>
        ) : (
          <ScrollView
            flex={1}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary.base}
              />
            }
          >
            {notifications.length === 0 ? (
              <YStack alignItems="center" justifyContent="center" paddingVertical="$10">
                <Text fontSize={15} color="$color" opacity={0.5}>
                  目前沒有通知
                </Text>
              </YStack>
            ) : (
              <YStack gap="$2">
                {/* 未讀 */}
                {unread.length > 0 && (
                  <YStack gap="$1">
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color="$color"
                      opacity={0.5}
                      paddingVertical="$2"
                    >
                      最新
                    </Text>
                    {unread.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        onPress={handlePress}
                        onAcceptConnect={handleAcceptConnect}
                        onRejectConnect={handleRejectConnect}
                      />
                    ))}
                  </YStack>
                )}

                {/* 已讀 */}
                {read.length > 0 && (
                  <YStack gap="$1">
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color="$color"
                      opacity={0.5}
                      paddingVertical="$2"
                    >
                      稍早
                    </Text>
                    {read.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        onPress={handlePress}
                        onAcceptConnect={handleAcceptConnect}
                        onRejectConnect={handleRejectConnect}
                      />
                    ))}
                  </YStack>
                )}
              </YStack>
            )}
          </ScrollView>
        )}
      </YStack>
    </SafeAreaView>
  );
}
