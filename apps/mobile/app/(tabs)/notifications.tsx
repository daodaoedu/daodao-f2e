import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, XStack, YStack } from "tamagui";
import { markNotificationRead, useNotifications } from "@daodao/api";
import { colors } from "@/generated/design-tokens";

const POLL_INTERVAL_MS = 30_000;

function getNotificationLabel(type: string, actorNickname?: string | null): string {
  const actor = actorNickname ?? "有人";
  switch (type) {
    case "buddy_request":
      return `${actor} 向你發送了夥伴邀請`;
    case "buddy_accepted":
      return `${actor} 接受了你的夥伴邀請`;
    case "practice_comment":
      return `${actor} 留言了你的練習`;
    case "practice_like":
      return `${actor} 對你的練習按讚`;
    case "check_in_comment":
      return `${actor} 留言了你的打卡`;
    case "check_in_like":
      return `${actor} 對你的打卡按讚`;
    case "mention":
      return `${actor} 提到了你`;
    default:
      return `${actor} 有新通知`;
  }
}

function getResourceRoute(entityType: string | null, entityId: string | null): string | null {
  if (!entityType || !entityId) return null;
  switch (entityType) {
    case "practice":
      return `/practices/${entityId}`;
    case "check_in":
      return `/check-ins/${entityId}`;
    case "user":
      return `/users/${entityId}`;
    default:
      return null;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useNotifications({ limit: 50 });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      mutate();
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [mutate]);

  const handleNotificationPress = useCallback(
    async (notification: {
      id: number;
      is_read: boolean;
      entity_type: string | null;
      entity_id: string | null;
    }) => {
      if (!notification.is_read) {
        markNotificationRead(notification.id).catch(() => {});
        mutate();
      }
      const route = getResourceRoute(notification.entity_type, notification.entity_id);
      if (route) {
        router.push(route as Parameters<typeof router.push>[0]);
      }
    },
    [router, mutate],
  );

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const notifications = data?.data?.notifications ?? [];

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text color="$color" opacity={0.6} textAlign="center">
            載入通知失敗
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8F8" }} edges={["top"]}>
      <YStack flex={1}>
        <XStack paddingHorizontal="$5" paddingVertical="$4">
          <Text fontSize={22} fontWeight="600" color={colors.text.dark}>
            通知
          </Text>
        </XStack>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={colors.primary.base}
            />
          }
        >
          {notifications.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" padding="$8" gap="$3">
              <Text fontSize={16} color="$color" opacity={0.5} textAlign="center">
                目前沒有通知
              </Text>
            </YStack>
          ) : (
            <YStack paddingBottom={100}>
              {notifications.map((notification) => (
                <Pressable
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <XStack
                    paddingHorizontal="$5"
                    paddingVertical="$4"
                    backgroundColor={notification.is_read ? "transparent" : colors.primary.palest}
                    borderBottomWidth={1}
                    borderBottomColor="#F0F0F0"
                    alignItems="center"
                    gap="$3"
                  >
                    <YStack
                      width={8}
                      height={8}
                      borderRadius={4}
                      backgroundColor={
                        notification.is_read ? "transparent" : colors.primary.base
                      }
                      flexShrink={0}
                    />
                    <YStack flex={1} gap="$1">
                      <Text
                        fontSize={15}
                        fontWeight={notification.is_read ? "400" : "600"}
                        color={colors.text.dark}
                        numberOfLines={2}
                      >
                        {getNotificationLabel(notification.type, notification.actor?.nickname)}
                      </Text>
                      <Text fontSize={11} color={colors.basic[400]} marginTop="$1">
                        {new Date(notification.created_at).toLocaleDateString("zh-TW", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </YStack>
                  </XStack>
                </Pressable>
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
