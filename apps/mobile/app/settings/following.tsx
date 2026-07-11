import { useFollowing } from "@daodao/api";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Card, ScrollView, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { unfollowTarget } from "@/hooks/useFollow";
import { useMobileTranslation } from "@/i18n";

interface IFollowItem {
  targetType: "user" | "practice";
  user?: { id: string; identifier?: string; name: string; photoURL?: string; bio?: string };
  practice?: { id: string; title: string; ownerName: string; ownerPhotoURL?: string };
}

export default function FollowingSettingsScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.followingSettings");
  const tCommon = useMobileTranslation("common");
  const [tab, setTab] = useState<"users" | "practices">("users");
  const { user: currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? "";

  const { data: followingData, isLoading, mutate } = useFollowing({ userId, limit: 100 });

  const items = (followingData?.data ?? []) as IFollowItem[];
  const followedUsers = items.filter((item) => item.targetType === "user" && item.user);
  const followedPractices = items.filter((item) => item.targetType === "practice" && item.practice);

  const handleUnfollow = async (targetType: "user" | "practice", targetId: string) => {
    try {
      await unfollowTarget(targetType, targetId);
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
            accessibilityLabel={tCommon("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            {t("title")}
          </Text>
        </XStack>

        {/* Tab Bar */}
        <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
          {(["users", "practices"] as const).map((tabValue) => (
            <YStack
              key={tabValue}
              flex={1}
              alignItems="center"
              paddingVertical="$3"
              borderBottomWidth={2}
              borderBottomColor={tab === tabValue ? colors.primary.base : "transparent"}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setTab(tabValue)}
            >
              <Text
                fontSize={14}
                fontWeight="500"
                color={tab === tabValue ? colors.primary.base : "$color"}
                opacity={tab === tabValue ? 1 : 0.5}
              >
                {tabValue === "users" ? t("usersTab") : t("practicesTab")}
              </Text>
            </YStack>
          ))}
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          {isLoading ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text fontSize={14} color="$color" opacity={0.5}>
                {t("loading")}
              </Text>
            </YStack>
          ) : tab === "users" ? (
            <YStack gap="$3">
              {followedUsers.length === 0 ? (
                <YStack alignItems="center" paddingVertical="$8">
                  <Text fontSize={14} color="$color" opacity={0.5}>
                    {t("emptyUsers")}
                  </Text>
                </YStack>
              ) : (
                followedUsers.map(({ user }) => {
                  if (!user) return null;
                  return (
                    <Card
                      key={user.id}
                      padding="$3"
                      backgroundColor="$background"
                      borderRadius="$md"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <XStack alignItems="center" gap="$3">
                        <Avatar circular size="$4">
                          {user.photoURL ? (
                            <Avatar.Image source={{ uri: user.photoURL }} />
                          ) : (
                            <Avatar.Fallback backgroundColor={colors.primary.palest}>
                              <Text fontSize={14} fontWeight="600" color={colors.primary.base}>
                                {user.name?.slice(0, 1)}
                              </Text>
                            </Avatar.Fallback>
                          )}
                        </Avatar>
                        <YStack flex={1}>
                          <Text fontSize={14} fontWeight="500" color="$color">
                            <Text
                              fontSize={14}
                              fontWeight="500"
                              color="$color"
                              onPress={() => router.push(`/users/${user.identifier ?? user.id}`)}
                            >
                              {user.name}
                            </Text>
                          </Text>
                          {user.bio && (
                            <Text fontSize={12} color="$color" opacity={0.5} numberOfLines={1}>
                              {user.bio}
                            </Text>
                          )}
                        </YStack>
                        <Button
                          size="$3"
                          backgroundColor="transparent"
                          borderWidth={1}
                          borderColor="$borderColor"
                          onPress={() => handleUnfollow("user", user.id)}
                        >
                          <Text fontSize={12} color="$color">
                            {t("unfollow")}
                          </Text>
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
                  <Text fontSize={14} color="$color" opacity={0.5}>
                    {t("emptyPractices")}
                  </Text>
                </YStack>
              ) : (
                followedPractices.map(({ practice }) => {
                  if (!practice) return null;
                  return (
                    <Card
                      key={practice.id}
                      padding="$3"
                      backgroundColor="$background"
                      borderRadius="$md"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <XStack alignItems="center" gap="$3">
                        <Avatar circular size="$4">
                          {practice.ownerPhotoURL ? (
                            <Avatar.Image source={{ uri: practice.ownerPhotoURL }} />
                          ) : (
                            <Avatar.Fallback backgroundColor={colors.primary.palest}>
                              <Text fontSize={14} fontWeight="600" color={colors.primary.base}>
                                {practice.ownerName?.slice(0, 1)}
                              </Text>
                            </Avatar.Fallback>
                          )}
                        </Avatar>
                        <YStack flex={1}>
                          <Text
                            fontSize={14}
                            fontWeight="500"
                            color="$color"
                            numberOfLines={1}
                            onPress={() => router.push(`/practices/${practice.id}`)}
                          >
                            {practice.title}
                          </Text>
                          <Text fontSize={12} color="$color" opacity={0.5}>
                            {practice.ownerName}
                          </Text>
                        </YStack>
                        <Button
                          size="$3"
                          backgroundColor="transparent"
                          borderWidth={1}
                          borderColor="$borderColor"
                          onPress={() => handleUnfollow("practice", practice.id)}
                        >
                          <Text fontSize={12} color="$color">
                            {t("unfollow")}
                          </Text>
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
