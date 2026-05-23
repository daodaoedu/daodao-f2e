import { Bell, ChevronRight, UserCheck, Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";
import { Button, Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";

interface IConnectionRequest {
  id: string;
}

interface IConnection {
  id: string;
}

interface IFollowItem {
  targetType: "user" | "practice";
}

interface IFollowUser {
  id: string;
}

function CountCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <Card
      flex={1}
      padding="$3"
      backgroundColor={colors.background.light}
      borderRadius="$md"
      borderWidth={1}
      borderColor={colors.border.light}
      gap="$2"
    >
      <XStack alignItems="center" justifyContent="space-between">
        {icon}
        <Text fontSize={22} fontWeight="700" color={colors.primary.base}>
          {value}
        </Text>
      </XStack>
      <Text fontSize={12} color="$color" opacity={0.65}>
        {label}
      </Text>
    </Card>
  );
}

function ActionRow({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Card
      padding="$4"
      backgroundColor={colors.background.light}
      borderRadius="$md"
      borderWidth={1}
      borderColor={colors.border.light}
      pressStyle={{ opacity: 0.78 }}
      onPress={onPress}
    >
      <XStack alignItems="center" gap="$3">
        <YStack flex={1} gap="$1">
          <Text fontSize={16} fontWeight="600" color="$color">
            {title}
          </Text>
          <Text fontSize={13} color="$color" opacity={0.62}>
            {description}
          </Text>
        </YStack>
        <ChevronRight size={20} color={colors.text.muted} />
      </XStack>
    </Card>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.explore");
  const { user: currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? "";

  const incoming = useSWR<IConnectionRequest[]>(
    "/connections/requests/incoming",
    () =>
      api.get<{ data: IConnectionRequest[] }>("/connections/requests/incoming").then((r) => r.data),
    { revalidateOnFocus: false }
  );
  const outgoing = useSWR<IConnectionRequest[]>(
    "/connections/requests/outgoing",
    () =>
      api.get<{ data: IConnectionRequest[] }>("/connections/requests/outgoing").then((r) => r.data),
    { revalidateOnFocus: false }
  );
  const connections = useSWR<IConnection[]>(
    "/connections",
    () => api.get<{ data: IConnection[] }>("/connections").then((r) => r.data),
    { revalidateOnFocus: false }
  );
  const following = useSWR<IFollowItem[]>(
    userId ? `/users/${userId}/following` : null,
    () => api.get<{ data: IFollowItem[] }>(`/users/${userId}/following`).then((r) => r.data),
    { revalidateOnFocus: false }
  );
  const followers = useSWR<IFollowUser[]>(
    userId ? `/users/${userId}/followers` : null,
    () => api.get<{ data: IFollowUser[] }>(`/users/${userId}/followers`).then((r) => r.data),
    { revalidateOnFocus: false }
  );

  const isLoading =
    incoming.isLoading ||
    outgoing.isLoading ||
    connections.isLoading ||
    following.isLoading ||
    followers.isLoading;
  const isRefreshing =
    incoming.isValidating ||
    outgoing.isValidating ||
    connections.isValidating ||
    following.isValidating ||
    followers.isValidating;

  const pendingCount = (incoming.data?.length ?? 0) + (outgoing.data?.length ?? 0);
  const connectionCount = connections.data?.length ?? 0;
  const followingCount = following.data?.length ?? 0;
  const followersCount = followers.data?.length ?? 0;

  const refreshAll = () => {
    void Promise.all([
      incoming.mutate(),
      outgoing.mutate(),
      connections.mutate(),
      following.mutate(),
      followers.mutate(),
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" justifyContent="space-between">
          <YStack gap="$1">
            <Text fontSize={24} fontWeight="700" color="$color">
              {t("title")}
            </Text>
            <Text fontSize={13} color="$color" opacity={0.6}>
              {t("subtitle")}
            </Text>
          </YStack>
        </XStack>

        <ScrollView
          flex={1}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
        >
          {isLoading ? (
            <YStack alignItems="center" paddingVertical="$8" gap="$3">
              <Spinner size="large" color={colors.primary.base} />
              <Text fontSize={14} color="$color" opacity={0.6}>
                {t("loading")}
              </Text>
            </YStack>
          ) : (
            <YStack gap="$4">
              <YStack gap="$3">
                <XStack gap="$3">
                  <CountCard
                    label={t("pending_requests")}
                    value={pendingCount}
                    icon={<Bell size={20} color={colors.primary.base} />}
                  />
                  <CountCard
                    label={t("partners")}
                    value={connectionCount}
                    icon={<Users size={20} color={colors.primary.base} />}
                  />
                </XStack>
                <XStack gap="$3">
                  <CountCard
                    label={t("following")}
                    value={followingCount}
                    icon={<UserCheck size={20} color={colors.primary.base} />}
                  />
                  <CountCard
                    label={t("followers")}
                    value={followersCount}
                    icon={<Users size={20} color={colors.primary.base} />}
                  />
                </XStack>
              </YStack>

              <YStack gap="$3">
                <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                  {t("social_actions")}
                </Text>
                <ActionRow
                  title={t("manage_connections")}
                  description={t("manage_connections_description")}
                  onPress={() => router.push("/settings/connections" as never)}
                />
                <ActionRow
                  title={t("manage_following")}
                  description={t("manage_following_description")}
                  onPress={() => router.push("/settings/following" as never)}
                />
                <ActionRow
                  title={t("learning_resources")}
                  description={t("learning_resources_description")}
                  onPress={() => router.push("/resource" as never)}
                />
              </YStack>

              <Card
                padding="$4"
                backgroundColor={colors.primary.palest}
                borderRadius="$md"
                borderWidth={1}
                borderColor={colors.primary.lighter}
                gap="$2"
              >
                <Text fontSize={16} fontWeight="600" color="$color">
                  {t("discover_title")}
                </Text>
                <Text fontSize={13} color="$color" opacity={0.7}>
                  {t("discover_description")}
                </Text>
                <Button
                  marginTop="$2"
                  backgroundColor={colors.primary.base}
                  onPress={() => router.push("/showcase" as never)}
                >
                  <Text color={colors.basic.white} fontWeight="600">
                    {t("browse_inspiration")}
                  </Text>
                </Button>
              </Card>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
