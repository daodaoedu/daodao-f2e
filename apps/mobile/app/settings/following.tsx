import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";
import useSWR from "swr";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/services/api-client";
import { colors } from "@/generated/design-tokens";

interface IFollowItem {
  targetType: "user" | "practice";
  user?: { id: string; name: string; photoURL?: string; bio?: string };
  practice?: { id: string; title: string; ownerName: string; ownerPhotoURL?: string };
}

export default function FollowingSettingsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "practices">("users");
  const { user: currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? "";

  const { data: followingItems, isLoading, mutate } = useSWR<IFollowItem[]>(
    userId ? `/users/${userId}/following` : null,
    () => api.get<{ data: IFollowItem[] }>(`/users/${userId}/following`).then((r) => r.data),
    { revalidateOnFocus: false }
  );

  const items = followingItems ?? [];
  const followedUsers = items.filter((item) => item.targetType === "user" && item.user);
  const followedPractices = items.filter((item) => item.targetType === "practice" && item.practice);

  const handleUnfollow = async (targetType: "user" | "practice", targetId: string) => {
    try {
      await api.delete(`/follows/${targetType}/${targetId}`);
      await mutate();
    } catch {
      // silently fail
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.back()}
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            關注設定
          </Text>
        </XStack>

        {/* Tab Bar */}
        <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
          {(["users", "practices"] as const).map((t) => (
            <YStack
              key={t}
              flex={1}
              alignItems="center"
              paddingVertical="$3"
              borderBottomWidth={2}
              borderBottomColor={tab === t ? colors.primary.base : "transparent"}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setTab(t)}
            >
              <Text
                fontSize={14}
                fontWeight="500"
                color={tab === t ? colors.primary.base : "$color"}
                opacity={tab === t ? 1 : 0.5}
              >
                {t === "users" ? "關注的使用者" : "關注的實踐"}
              </Text>
            </YStack>
          ))}
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          {isLoading ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text fontSize={14} color="$color" opacity={0.5}>載入中...</Text>
            </YStack>
          ) : tab === "users" ? (
            <YStack gap="$3">
              {followedUsers.length === 0 ? (
                <YStack alignItems="center" paddingVertical="$8">
                  <Text fontSize={14} color="$color" opacity={0.5}>尚未關注任何使用者</Text>
                </YStack>
              ) : (
                followedUsers.map(({ user }) => {
                  if (!user) return null;
                  return (
                    <Card key={user.id} padding="$3" backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
                      <XStack alignItems="center" gap="$3">
                        <Avatar circular size="$4">
                          {user.photoURL ? (
                            <Avatar.Image source={{ uri: user.photoURL }} />
                          ) : (
                            <Avatar.Fallback backgroundColor={colors.primary.palest}>
                              <Text fontSize={14} fontWeight="600" color={colors.primary.base}>{user.name?.slice(0, 1)}</Text>
                            </Avatar.Fallback>
                          )}
                        </Avatar>
                        <YStack flex={1}>
                          <Text fontSize={14} fontWeight="500" color="$color">{user.name}</Text>
                          {user.bio && <Text fontSize={12} color="$color" opacity={0.5} numberOfLines={1}>{user.bio}</Text>}
                        </YStack>
                        <Button size="$3" backgroundColor="transparent" borderWidth={1} borderColor="$borderColor" onPress={() => handleUnfollow("user", user.id)}>
                          <Text fontSize={12} color="$color">取消關注</Text>
                        </Button>
                      </XStack>
                    </Card>
                  );
                })
              )}
            </YStack>
          ) : (
            <YStack gap="$3">
              {followedPractices.length === 0 ? (
                <YStack alignItems="center" paddingVertical="$8">
                  <Text fontSize={14} color="$color" opacity={0.5}>尚未關注任何實踐</Text>
                </YStack>
              ) : (
                followedPractices.map(({ practice }) => {
                  if (!practice) return null;
                  return (
                    <Card key={practice.id} padding="$3" backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
                      <XStack alignItems="center" gap="$3">
                        <Avatar circular size="$4">
                          {practice.ownerPhotoURL ? (
                            <Avatar.Image source={{ uri: practice.ownerPhotoURL }} />
                          ) : (
                            <Avatar.Fallback backgroundColor={colors.primary.palest}>
                              <Text fontSize={14} fontWeight="600" color={colors.primary.base}>{practice.ownerName?.slice(0, 1)}</Text>
                            </Avatar.Fallback>
                          )}
                        </Avatar>
                        <YStack flex={1}>
                          <Text fontSize={14} fontWeight="500" color="$color" numberOfLines={1}>{practice.title}</Text>
                          <Text fontSize={12} color="$color" opacity={0.5}>{practice.ownerName}</Text>
                        </YStack>
                        <Button size="$3" backgroundColor="transparent" borderWidth={1} borderColor="$borderColor" onPress={() => handleUnfollow("practice", practice.id)}>
                          <Text fontSize={12} color="$color">取消關注</Text>
                        </Button>
                      </XStack>
                    </Card>
                  );
                })
              )}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
