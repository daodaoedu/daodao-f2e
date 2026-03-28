import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { NotificationType } from "@/constants/notification-type";
import { colors } from "@/generated/design-tokens";
import {
  type INotificationApiItem,
  markAllNotificationsRead,
  markNotificationRead,
  respondConnectionRequest,
  revalidateAllNotifications,
  useNotifications,
} from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/utils/format-time";

// ============================================================================
// Helpers
// ============================================================================

const BACKEND_TYPE_MAP: Record<string, string> = {
  UserFollowed: NotificationType.followUser,
  PracticeFollowed: NotificationType.followPractice,
  Connect: NotificationType.connect,
  ConnectAccepted: NotificationType.agreeConnect,
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

function getNotificationText(item: INotificationApiItem): string {
  const type = normalizeType(item.type);
  const name = item.actor.name;
  const count = item.aggregationCount ?? 1;
  const suffix = count > 1 ? `與其他 ${count - 1} 人` : "";

  switch (type) {
    case NotificationType.reaction:
      return `${name}${suffix} 對你的主題實踐「${item.practiceTitle ?? ""}」給了反應`;
    case NotificationType.comment:
      return `${name} 回覆了你的主題實踐「${item.practiceTitle ?? ""}」：${item.content ?? ""}`;
    case NotificationType.followUser:
      return `${name} 關注了你`;
    case NotificationType.followPractice:
      return `${name} 關注了你的主題實踐「${item.practiceTitle ?? ""}」`;
    case NotificationType.connect:
      return `${name} 對你發出了連結請求`;
    case NotificationType.agreeConnect:
      return `恭喜！${name} 同意了你的連結請求`;
    case NotificationType.updatePracticeCheckin:
      return `${name} 更新了主題實踐「${item.practiceTitle ?? ""}」`;
    case NotificationType.updatePracticeFinish:
      return `${name} 完成了主題實踐「${item.practiceTitle ?? ""}」`;
    default:
      return `${name} 發出了一則通知`;
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
            {getNotificationText(item)}
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
                同意
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
                忽略
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
  const { notifications, unreadCount, isLoading, mutate } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  }, [mutate]);

  const handlePress = useCallback(
    async (item: INotificationApiItem) => {
      if (!item.isRead) {
        markNotificationRead(item.id).catch(() => {});
        revalidateAllNotifications();
      }

      // Deep link based on entity type
      switch (item.entityType) {
        case "practice":
        case "comment":
          if (item.entityId) router.push(`/practices/${item.entityId}` as never);
          break;
        case "user":
        case "connection":
          if (item.actor.id) router.push(`/users/${item.actor.id}` as never);
          break;
      }
    },
    [router]
  );

  const handleAcceptConnect = useCallback(async (item: INotificationApiItem) => {
    if (!item.connectionRequestId) return;
    try {
      await respondConnectionRequest(String(item.connectionRequestId), "accept");
      Alert.alert("", `你同意了 ${item.actor.name} 的連結請求！`);
      revalidateAllNotifications();
    } catch {
      Alert.alert("錯誤", "操作失敗，請稍後再試");
    }
  }, []);

  const handleRejectConnect = useCallback(async (item: INotificationApiItem) => {
    if (!item.connectionRequestId) return;
    try {
      await respondConnectionRequest(String(item.connectionRequestId), "reject");
      revalidateAllNotifications();
    } catch {
      Alert.alert("錯誤", "操作失敗，請稍後再試");
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await markAllNotificationsRead().catch(() => {});
    revalidateAllNotifications();
  }, []);

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

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
