import {
  ApiError,
  disconnectUser,
  getUserPractices,
  getUserProfileByIdentifier,
  respondConnectionRequest,
  sendConnectionRequest,
  type UserProfileData,
  useConnectionStatus,
  withdrawConnectionRequest,
} from "@daodao/api";
import {
  ArrowLeft,
  Check,
  Clock,
  Link,
  MapPin,
  RefreshCw,
  UserPlus,
  UserRoundCheck,
  X,
} from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  View as RNView,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";
import { Avatar, Card, Separator, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { UserInfoCard } from "@/components/user";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { followTarget, unfollowTarget, useFollowStatus } from "@/hooks/useFollow";
import { useMobileTranslation } from "@/i18n";

type ConnectionStatus = "none" | "outgoing" | "incoming" | "connected";

function getIdentifierParam(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

function getDisplayLocation(profile: UserProfileData) {
  return profile.locationNameZh ?? profile.locationNameEn ?? profile.location;
}

function formatCount(value: number | null | undefined) {
  return String(value ?? 0);
}

function getPracticeStatusLabel(status: string, t: (key: string) => string) {
  switch (status) {
    case "draft":
      return t("status_draft");
    case "not_started":
      return t("status_not_started");
    case "active":
      return t("status_active");
    case "completed":
      return t("status_completed");
    case "archived":
      return t("status_archived");
    default:
      return t("status_unknown");
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function UserProfileRoute() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.userProfile");
  const params = useLocalSearchParams<{ identifier?: string | string[] }>();
  const identifier = getIdentifierParam(params.identifier);
  const [isMutatingFollow, setIsMutatingFollow] = useState(false);
  const [isMutatingConnection, setIsMutatingConnection] = useState(false);
  const { user: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();

  const {
    data,
    error,
    isLoading,
    mutate: mutateProfile,
  } = useSWR(
    identifier ? ["/api/v1/users/profile/{identifier}", identifier] : null,
    ([, userIdentifier]) => getUserProfileByIdentifier(userIdentifier),
    { revalidateOnFocus: false }
  );

  const profile = data?.data;
  const targetUserId = profile?.id ?? "";
  const isOwnProfile = Boolean(currentUser?.id && targetUserId && currentUser.id === targetUserId);
  const canUseConnectionActions = Boolean(currentUser?.id && targetUserId && !isOwnProfile);
  const {
    isFollowing,
    isLoading: isFollowStatusLoading,
    mutate: mutateFollowStatus,
  } = useFollowStatus("user", targetUserId);

  const {
    data: practicesResponse,
    error: practicesError,
    isLoading: isPracticesLoading,
    mutate: mutatePractices,
  } = useSWR(
    targetUserId ? ["/api/v1/practices/user/{userId}", targetUserId] : null,
    ([, userId]) => getUserPractices(userId, { status: "all", limit: 10 }),
    { revalidateOnFocus: false }
  );

  const {
    data: connectionStatusResponse,
    isLoading: isConnectionStatusLoading,
    mutate: mutateConnectionStatus,
  } = useConnectionStatus(canUseConnectionActions ? targetUserId : null);

  const isRefreshing = isLoading || isCurrentUserLoading;
  const canFollow = Boolean(targetUserId) && !isOwnProfile;
  const displayName = profile?.name || t("unnamed_user");
  const displayLocation = profile ? getDisplayLocation(profile) : null;
  const practices = practicesResponse?.data?.data ?? [];

  const connectionStatus: ConnectionStatus = connectionStatusResponse?.data.status ?? "none";
  const connectionRequestId = connectionStatusResponse?.data.requestId ?? null;

  const stats = useMemo(
    () =>
      profile
        ? [
            { label: t("followers"), value: formatCount(profile.followersCount), hidden: false },
            {
              label: t("connections"),
              value: profile.hideConnectionsCount
                ? t("hidden_count")
                : formatCount(profile.connectionsCount),
              hidden: profile.hideConnectionsCount,
            },
            {
              label: t("recent_practices"),
              value: formatCount(profile.recentPracticeCount),
              hidden: false,
            },
            {
              label: t("common_circles"),
              value: formatCount(profile.commonCirclesCount),
              hidden: profile.commonCirclesCount == null,
            },
          ]
        : [],
    [profile, t]
  );

  const handleRefresh = useCallback(() => {
    mutateProfile();
    mutateFollowStatus();
    mutatePractices();
    mutateConnectionStatus();
  }, [mutateConnectionStatus, mutateFollowStatus, mutatePractices, mutateProfile]);

  const handleToggleFollow = useCallback(async () => {
    if (!targetUserId || isMutatingFollow) return;

    setIsMutatingFollow(true);
    try {
      if (isFollowing) {
        await unfollowTarget("user", targetUserId);
      } else {
        await followTarget("user", targetUserId);
      }
      await Promise.all([mutateFollowStatus(), mutateProfile()]);
    } catch (followError) {
      Alert.alert(
        isFollowing ? t("unfollow_failed") : t("follow_failed"),
        followError instanceof Error ? followError.message : t("retry_later")
      );
    } finally {
      setIsMutatingFollow(false);
    }
  }, [isFollowing, isMutatingFollow, mutateFollowStatus, mutateProfile, t, targetUserId]);

  const refreshConnectionState = useCallback(
    () => Promise.all([mutateConnectionStatus(), mutateProfile()]),
    [mutateConnectionStatus, mutateProfile]
  );

  const handleSendConnectionRequest = useCallback(async () => {
    if (!targetUserId || isMutatingConnection) return;

    setIsMutatingConnection(true);
    try {
      await sendConnectionRequest({ receiverExternalId: targetUserId });
      await refreshConnectionState();
    } catch (connectionError) {
      if (connectionError instanceof ApiError && connectionError.status === 409) {
        await refreshConnectionState();
        return;
      }
      Alert.alert(t("send_connection_failed"), getErrorMessage(connectionError, t("retry_later")));
    } finally {
      setIsMutatingConnection(false);
    }
  }, [isMutatingConnection, refreshConnectionState, t, targetUserId]);

  const handleWithdrawConnectionRequest = useCallback(async () => {
    if (!connectionRequestId || isMutatingConnection) return;

    setIsMutatingConnection(true);
    try {
      await withdrawConnectionRequest(String(connectionRequestId));
      await refreshConnectionState();
    } catch (connectionError) {
      Alert.alert(
        t("withdraw_connection_failed"),
        getErrorMessage(connectionError, t("retry_later"))
      );
    } finally {
      setIsMutatingConnection(false);
    }
  }, [connectionRequestId, isMutatingConnection, refreshConnectionState, t]);

  const handleRespondConnectionRequest = useCallback(
    async (action: "accept" | "reject") => {
      if (!connectionRequestId || isMutatingConnection) return;

      setIsMutatingConnection(true);
      try {
        await respondConnectionRequest(String(connectionRequestId), action);
        await refreshConnectionState();
      } catch (connectionError) {
        Alert.alert(
          t("respond_connection_failed"),
          getErrorMessage(connectionError, t("retry_later"))
        );
      } finally {
        setIsMutatingConnection(false);
      }
    },
    [connectionRequestId, isMutatingConnection, refreshConnectionState, t]
  );

  const handleDisconnect = useCallback(() => {
    if (connectionStatus !== "connected" || isMutatingConnection) return;

    Alert.alert(t("disconnect_title"), t("disconnect_message", { name: displayName }), [
      { text: t("keep_connection"), style: "cancel" },
      {
        text: t("disconnect"),
        style: "destructive",
        onPress: async () => {
          setIsMutatingConnection(true);
          try {
            await disconnectUser(targetUserId);
            await refreshConnectionState();
            await mutateProfile();
          } catch (connectionError) {
            Alert.alert(t("disconnect_failed"), getErrorMessage(connectionError, t("retry_later")));
          } finally {
            setIsMutatingConnection(false);
          }
        },
      },
    ]);
  }, [
    connectionStatus,
    displayName,
    isMutatingConnection,
    mutateProfile,
    refreshConnectionState,
    t,
    targetUserId,
  ]);

  return (
    <RNView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <XStack paddingHorizontal="$4" paddingVertical="$3" alignItems="center" gap="$3">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={24} color={colors.text.dark} />
          </Pressable>
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
              {t("title")}
            </Text>
            {profile?.customId ? (
              <Text fontSize={12} color={colors.text.muted}>
                @{profile.customId}
              </Text>
            ) : null}
          </YStack>
        </XStack>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.base}
            />
          }
        >
          {isLoading || isCurrentUserLoading ? (
            <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10">
              <RefreshCw size={24} color={colors.logo.cyan} />
              <Text marginTop="$3" color={colors.text.dark}>
                {t("loading")}
              </Text>
            </YStack>
          ) : error || !profile ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingVertical="$10"
              gap="$3"
            >
              <Text fontSize={18} fontWeight="500" color={colors.text.dark}>
                {t("not_found")}
              </Text>
              <Text textAlign="center" color={colors.text.muted}>
                {t("not_found_description")}
              </Text>
              <Button
                borderRadius="$md"
                backgroundColor={colors.logo.cyan}
                pressStyle={{ opacity: 0.8 }}
                onPress={() => mutateProfile()}
              >
                <Text color={colors.text.light} fontWeight="500">
                  {t("refresh")}
                </Text>
              </Button>
            </YStack>
          ) : (
            <YStack gap="$4">
              <Card
                backgroundColor={colors.background.light}
                borderRadius={16}
                padding="$5"
                borderWidth={1}
                borderColor={colors.border.light}
                elevate
                elevation={2}
              >
                <XStack gap="$4" alignItems="center">
                  <Avatar circular size={88}>
                    {profile.photoURL ? (
                      <Avatar.Image source={{ uri: profile.photoURL }} />
                    ) : (
                      <Avatar.Fallback
                        backgroundColor={colors.background.veryLightGray}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize={24} fontWeight="500" color={colors.text.dark}>
                          {displayName.charAt(0)}
                        </Text>
                      </Avatar.Fallback>
                    )}
                  </Avatar>

                  <YStack flex={1} gap="$1">
                    <Text
                      fontSize={22}
                      fontWeight="500"
                      color={colors.basic.black}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                    {profile.customId ? (
                      <Text fontSize={13} color={colors.text.muted}>
                        @{profile.customId}
                      </Text>
                    ) : null}
                    {displayLocation ? (
                      <XStack alignItems="center" gap="$1">
                        <MapPin size={16} color={colors.logo.cyan} />
                        <Text fontSize={12} color={colors.logo.cyan} numberOfLines={1}>
                          {displayLocation}
                        </Text>
                      </XStack>
                    ) : null}
                  </YStack>
                </XStack>

                {profile.personalSlogan ? (
                  <Text marginTop="$4" fontSize={15} color={colors.text.dark}>
                    {profile.personalSlogan}
                  </Text>
                ) : null}

                {canFollow ? (
                  <YStack marginTop="$4" gap="$2">
                    <Button
                      height={44}
                      borderRadius="$md"
                      backgroundColor={isFollowing ? colors.background.light : colors.logo.orange}
                      borderWidth={isFollowing ? 1 : 0}
                      borderColor={colors.border.light}
                      disabled={isFollowStatusLoading || isMutatingFollow}
                      pressStyle={{ opacity: 0.8 }}
                      onPress={handleToggleFollow}
                    >
                      <XStack alignItems="center" gap="$2">
                        {isFollowing ? (
                          <UserRoundCheck size={18} color={colors.text.dark} />
                        ) : (
                          <UserPlus size={18} color={colors.text.light} />
                        )}
                        <Text
                          color={isFollowing ? colors.text.dark : colors.text.light}
                          fontWeight="500"
                        >
                          {isMutatingFollow
                            ? t("processing")
                            : isFollowing
                              ? t("following")
                              : t("follow")}
                        </Text>
                      </XStack>
                    </Button>

                    {isConnectionStatusLoading ? (
                      <Button
                        height={44}
                        borderRadius="$md"
                        backgroundColor={colors.background.light}
                        borderWidth={1}
                        borderColor={colors.border.light}
                        disabled
                      >
                        <Text color={colors.text.muted} fontWeight="500">
                          {t("loading_connection_status")}
                        </Text>
                      </Button>
                    ) : connectionStatus === "incoming" ? (
                      <XStack gap="$2">
                        <Button
                          flex={1}
                          height={44}
                          borderRadius="$md"
                          backgroundColor={colors.logo.cyan}
                          disabled={isMutatingConnection}
                          pressStyle={{ opacity: 0.8 }}
                          onPress={() => handleRespondConnectionRequest("accept")}
                        >
                          <XStack alignItems="center" gap="$2">
                            <Check size={18} color={colors.text.light} />
                            <Text color={colors.text.light} fontWeight="500">
                              {t("accept_connection")}
                            </Text>
                          </XStack>
                        </Button>
                        <Button
                          flex={1}
                          height={44}
                          borderRadius="$md"
                          backgroundColor={colors.background.light}
                          borderWidth={1}
                          borderColor={colors.border.light}
                          disabled={isMutatingConnection}
                          pressStyle={{ opacity: 0.8 }}
                          onPress={() => handleRespondConnectionRequest("reject")}
                        >
                          <XStack alignItems="center" gap="$2">
                            <X size={18} color={colors.text.dark} />
                            <Text color={colors.text.dark} fontWeight="500">
                              {t("ignore")}
                            </Text>
                          </XStack>
                        </Button>
                      </XStack>
                    ) : (
                      <Button
                        height={44}
                        borderRadius="$md"
                        backgroundColor={
                          connectionStatus === "none" ? colors.logo.cyan : colors.background.light
                        }
                        borderWidth={connectionStatus === "none" ? 0 : 1}
                        borderColor={colors.border.light}
                        disabled={isMutatingConnection}
                        pressStyle={{ opacity: 0.8 }}
                        onPress={
                          connectionStatus === "connected"
                            ? handleDisconnect
                            : connectionStatus === "outgoing"
                              ? handleWithdrawConnectionRequest
                              : handleSendConnectionRequest
                        }
                      >
                        <XStack alignItems="center" gap="$2">
                          {connectionStatus === "connected" ? (
                            <Link size={18} color={colors.text.dark} />
                          ) : connectionStatus === "outgoing" ? (
                            <Clock size={18} color={colors.text.dark} />
                          ) : (
                            <UserPlus size={18} color={colors.text.light} />
                          )}
                          <Text
                            color={
                              connectionStatus === "none" ? colors.text.light : colors.text.dark
                            }
                            fontWeight="500"
                          >
                            {isMutatingConnection
                              ? t("processing")
                              : connectionStatus === "connected"
                                ? t("disconnect")
                                : connectionStatus === "outgoing"
                                  ? t("withdraw_connection")
                                  : t("request_connection")}
                          </Text>
                        </XStack>
                      </Button>
                    )}
                  </YStack>
                ) : null}
              </Card>

              <XStack gap="$3" flexWrap="wrap">
                {stats.map((item) => (
                  <Card
                    key={item.label}
                    flexBasis="47%"
                    flexGrow={1}
                    backgroundColor={colors.background.light}
                    borderRadius={12}
                    padding="$4"
                    borderWidth={1}
                    borderColor={colors.border.light}
                  >
                    <Text
                      fontSize={20}
                      fontWeight="600"
                      color={item.hidden ? colors.text.muted : colors.text.dark}
                    >
                      {item.value}
                    </Text>
                    <Text marginTop="$1" fontSize={12} color={colors.text.muted}>
                      {item.label}
                    </Text>
                  </Card>
                ))}
              </XStack>

              <UserInfoCard
                name={profile.name}
                location={displayLocation}
                selfIntroduction={profile.selfIntroduction}
                photoURL={profile.photoURL}
                personalSlogan={profile.personalSlogan}
                contactList={profile.contactList}
              />

              <Card
                backgroundColor={colors.background.light}
                borderRadius={16}
                padding="$5"
                borderWidth={1}
                borderColor={colors.border.light}
              >
                <Text fontSize={18} fontWeight="500" color={colors.text.dark}>
                  {t("public_practices")}
                </Text>
                <Separator marginVertical="$3" borderColor={colors.border.light} />
                {isPracticesLoading ? (
                  <YStack paddingVertical="$4" alignItems="center">
                    <Text fontSize={14} color={colors.text.muted}>
                      {t("loading_practices")}
                    </Text>
                  </YStack>
                ) : practicesError ? (
                  <YStack gap="$3">
                    <Text fontSize={14} color={colors.text.muted}>
                      {t("public_practices_error")}
                    </Text>
                    <Button
                      alignSelf="flex-start"
                      size="$3"
                      borderRadius="$md"
                      backgroundColor={colors.background.light}
                      borderWidth={1}
                      borderColor={colors.border.light}
                      onPress={() => mutatePractices()}
                    >
                      <Text fontSize={13} color={colors.text.dark}>
                        {t("refresh")}
                      </Text>
                    </Button>
                  </YStack>
                ) : practices.length === 0 ? (
                  <Text fontSize={14} color={colors.text.muted}>
                    {t("empty_public_practices")}
                  </Text>
                ) : (
                  <YStack gap="$3">
                    {practices.map((practice) => (
                      <Pressable
                        key={practice.id}
                        onPress={() => router.push(`/practices/${practice.id}` as never)}
                      >
                        <Card
                          padding="$4"
                          backgroundColor={colors.background.veryLightGray}
                          borderRadius={12}
                          borderWidth={1}
                          borderColor={colors.border.light}
                          pressStyle={{ opacity: 0.85 }}
                        >
                          <YStack gap="$2">
                            <XStack alignItems="center" gap="$2">
                              <Text
                                flex={1}
                                fontSize={15}
                                fontWeight="500"
                                color={colors.text.dark}
                                numberOfLines={1}
                              >
                                {practice.title}
                              </Text>
                              <Text
                                fontSize={11}
                                color={colors.logo.cyan}
                                backgroundColor={colors.background.light}
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$sm"
                              >
                                {getPracticeStatusLabel(practice.status, t)}
                              </Text>
                            </XStack>
                            {practice.practiceAction ? (
                              <Text fontSize={13} color={colors.text.muted} numberOfLines={2}>
                                {practice.practiceAction}
                              </Text>
                            ) : null}
                            <XStack gap="$3" flexWrap="wrap">
                              <Text fontSize={12} color={colors.text.muted}>
                                {t("check_in_count", { count: practice.checkInCount })}
                              </Text>
                              <Text fontSize={12} color={colors.text.muted}>
                                {t("progress_percent", {
                                  progress: practice.progressPercentage ?? 0,
                                })}
                              </Text>
                            </XStack>
                            {practice.tags.length > 0 ? (
                              <XStack gap="$2" flexWrap="wrap">
                                {practice.tags.slice(0, 3).map((tag) => (
                                  <Text
                                    key={tag}
                                    fontSize={11}
                                    color={colors.text.muted}
                                    backgroundColor={colors.background.light}
                                    paddingHorizontal="$2"
                                    paddingVertical="$1"
                                    borderRadius="$sm"
                                  >
                                    #{tag}
                                  </Text>
                                ))}
                              </XStack>
                            ) : null}
                          </YStack>
                        </Card>
                      </Pressable>
                    ))}
                  </YStack>
                )}
              </Card>
            </YStack>
          )}
        </ScrollView>
      </SafeAreaView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B8E8FD",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
