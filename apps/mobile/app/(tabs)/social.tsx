import {
  disconnectUser,
  respondConnectionRequest,
  useConnections,
  useFollowers,
  useFollowing,
  useIncomingConnectionRequests,
  useOutgoingConnectionRequests,
  withdrawConnectionRequest,
  type IConnectionItem,
  type IConnectionRequest,
  type IFollowPracticeProfile,
  type IFollowUserProfile,
} from "@daodao/api";
import { Link2, UserPlus, UsersRound } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { type ReactNode, useState } from "react";
import { Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Button, Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { unfollowTarget } from "@/hooks/useFollow";

type MainTab = "connections" | "following";
type FollowTab = "users" | "practices";

const getUserIdentifier = (user?: Pick<IFollowUserProfile, "id" | "identifier"> | null) =>
  user?.identifier ?? user?.id ?? "";

function EmptyState({ icon, text }: { icon: "connections" | "following"; text: string }) {
  const Icon = icon === "connections" ? UsersRound : UserPlus;
  return (
    <YStack alignItems="center" paddingVertical="$8" gap="$3">
      <YStack
        width={56}
        height={56}
        borderRadius={28}
        backgroundColor={colors.basic[100]}
        alignItems="center"
        justifyContent="center"
      >
        <Icon size={24} color={colors.primary.base} />
      </YStack>
      <Text fontSize={14} color="$color" opacity={0.55} textAlign="center">
        {text}
      </Text>
    </YStack>
  );
}

function UserAvatar({ name, photoURL }: { name: string; photoURL?: string | null }) {
  return (
    <Avatar circular size="$4">
      {photoURL ? (
        <Avatar.Image source={{ uri: photoURL }} />
      ) : (
        <Avatar.Fallback backgroundColor={colors.primary.palest}>
          <Text fontSize={14} fontWeight="600" color={colors.primary.base}>
            {name.slice(0, 1)}
          </Text>
        </Avatar.Fallback>
      )}
    </Avatar>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
      {children}
    </Text>
  );
}

export default function SocialTab() {
  const router = useRouter();
  const [tab, setTab] = useState<MainTab>("connections");
  const [followTab, setFollowTab] = useState<FollowTab>("users");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user: currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? "";

  const incoming = useIncomingConnectionRequests({ limit: 100 });
  const outgoing = useOutgoingConnectionRequests({ limit: 100 });
  const connections = useConnections({ limit: 100 });
  const following = useFollowing({ userId, limit: 100 });
  const followers = useFollowers({ userId, limit: 100 });

  const isConnectionsLoading = incoming.isLoading || outgoing.isLoading || connections.isLoading;
  const isFollowingLoading = following.isLoading || followers.isLoading;
  const incomingRequests = incoming.data?.data ?? [];
  const outgoingRequests = outgoing.data?.data ?? [];
  const connectionItems = connections.data?.data ?? [];
  const followingItems = following.data?.data ?? [];
  const followerItems = followers.data?.data ?? [];
  const followedUsers = followingItems.filter((item) => item.targetType === "user" && item.user);
  const followedPractices = followingItems.filter(
    (item) => item.targetType === "practice" && item.practice
  );

  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        incoming.mutate(),
        outgoing.mutate(),
        connections.mutate(),
        following.mutate(),
        followers.mutate(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAccept = async (request: IConnectionRequest) => {
    const name = request.requesterNickname ?? "用戶";
    try {
      await respondConnectionRequest(String(request.requestId), "accept");
      await Promise.all([incoming.mutate(), connections.mutate()]);
    } catch {
      Alert.alert("操作失敗", `無法接受 ${name} 的連結請求，請稍後再試。`);
    }
  };

  const handleIgnore = (request: IConnectionRequest) => {
    const name = request.requesterNickname ?? "用戶";
    Alert.alert("忽略連結請求？", `確定要忽略來自 ${name} 的連結請求嗎？`, [
      { text: "先不要", style: "cancel" },
      {
        text: "忽略",
        onPress: async () => {
          try {
            await respondConnectionRequest(String(request.requestId), "reject");
            await incoming.mutate();
          } catch {
            Alert.alert("操作失敗", "請稍後再試。");
          }
        },
      },
    ]);
  };

  const handleWithdraw = (request: IConnectionRequest) => {
    const name = request.receiverNickname ?? "用戶";
    Alert.alert("撤回連結請求？", `確定要撤回發給 ${name} 的連結請求嗎？`, [
      { text: "先不要", style: "cancel" },
      {
        text: "撤回",
        onPress: async () => {
          try {
            await withdrawConnectionRequest(String(request.requestId));
            await outgoing.mutate();
          } catch {
            Alert.alert("操作失敗", "請稍後再試。");
          }
        },
      },
    ]);
  };

  const handleDisconnect = (connection: IConnectionItem) => {
    const name = connection.nickname ?? "用戶";
    Alert.alert("解除連結？", `解除連結後，你與 ${name} 將失去對彼此非公開內容的存取權。`, [
      { text: "先不要", style: "cancel" },
      {
        text: "解除連結",
        style: "destructive",
        onPress: async () => {
          try {
            await disconnectUser(connection.externalId);
            await connections.mutate();
          } catch {
            Alert.alert("操作失敗", "請稍後再試。");
          }
        },
      },
    ]);
  };

  const handleUnfollow = async (targetType: "user" | "practice", targetId: string) => {
    try {
      await unfollowTarget(targetType, targetId);
      await following.mutate();
    } catch {
      Alert.alert("操作失敗", "無法取消關注，請稍後再試。");
    }
  };

  const renderTabButton = (value: MainTab, label: string) => (
    <YStack
      key={value}
      flex={1}
      alignItems="center"
      paddingVertical="$3"
      borderBottomWidth={2}
      borderBottomColor={tab === value ? colors.primary.base : "transparent"}
      pressStyle={{ opacity: 0.7 }}
      onPress={() => setTab(value)}
    >
      <Text
        fontSize={14}
        fontWeight="600"
        color={tab === value ? colors.primary.base : "$color"}
        opacity={tab === value ? 1 : 0.5}
      >
        {label}
      </Text>
    </YStack>
  );

  const renderConnectionCard = (connection: IConnectionItem) => {
    const name = connection.nickname ?? "用戶";
    return (
      <Card
        key={connection.connectionId}
        padding="$3"
        backgroundColor="$background"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <XStack alignItems="center" gap="$3">
          <UserAvatar name={name} photoURL={connection.photoUrl} />
          <Text
            flex={1}
            fontSize={14}
            fontWeight="500"
            color="$color"
            numberOfLines={1}
            onPress={() => router.push(`/users/${connection.externalId}`)}
          >
            {name}
          </Text>
          <Button
            size="$3"
            backgroundColor="transparent"
            borderWidth={1}
            borderColor="$borderColor"
            onPress={() => handleDisconnect(connection)}
          >
            <Text fontSize={12} color="$color">
              解除連結
            </Text>
          </Button>
        </XStack>
      </Card>
    );
  };

  const renderConnections = () => {
    if (isConnectionsLoading) return <LoadingState />;

    return (
      <YStack gap="$5">
        {incomingRequests.length > 0 && (
          <YStack gap="$3">
            <SectionTitle>收到的請求</SectionTitle>
            {incomingRequests.map((request) => {
              const name = request.requesterNickname ?? "用戶";
              return (
                <Card
                  key={request.requestId}
                  padding="$3"
                  backgroundColor="$background"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <YStack gap="$3">
                    <XStack alignItems="center" gap="$3">
                      <UserAvatar name={name} photoURL={request.requesterPhotoUrl} />
                      <Text
                        flex={1}
                        fontSize={14}
                        fontWeight="500"
                        color="$color"
                        onPress={() => router.push(`/users/${request.requesterExternalId}`)}
                      >
                        {name}
                      </Text>
                    </XStack>
                    {request.intent && (
                      <YStack padding="$2" backgroundColor={colors.basic[100]} borderRadius="$sm">
                        <Text fontSize={12} color="$color" opacity={0.7}>
                          「{request.intent}」
                        </Text>
                      </YStack>
                    )}
                    <XStack gap="$2">
                      <Button
                        flex={1}
                        size="$3"
                        backgroundColor={colors.primary.base}
                        onPress={() => handleAccept(request)}
                      >
                        <Text fontSize={13} color={colors.basic.white} fontWeight="600">
                          接受
                        </Text>
                      </Button>
                      <Button
                        flex={1}
                        size="$3"
                        backgroundColor="transparent"
                        borderWidth={1}
                        borderColor="$borderColor"
                        onPress={() => handleIgnore(request)}
                      >
                        <Text fontSize={13} color="$color">
                          忽略
                        </Text>
                      </Button>
                    </XStack>
                  </YStack>
                </Card>
              );
            })}
          </YStack>
        )}

        {outgoingRequests.length > 0 && (
          <YStack gap="$3">
            <SectionTitle>發出的請求</SectionTitle>
            {outgoingRequests.map((request) => {
              const name = request.receiverNickname ?? "用戶";
              return (
                <Card
                  key={request.requestId}
                  padding="$3"
                  backgroundColor="$background"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <XStack alignItems="center" gap="$3">
                    <UserAvatar name={name} photoURL={request.receiverPhotoUrl} />
                    <YStack flex={1}>
                      <Text
                        fontSize={14}
                        fontWeight="500"
                        color="$color"
                        onPress={() => router.push(`/users/${request.receiverExternalId}`)}
                      >
                        {name}
                      </Text>
                      <Text fontSize={12} color="$color" opacity={0.5}>
                        等待對方回應
                      </Text>
                    </YStack>
                    <Button
                      size="$3"
                      backgroundColor="transparent"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={() => handleWithdraw(request)}
                    >
                      <Text fontSize={12} color="$color">
                        撤回
                      </Text>
                    </Button>
                  </XStack>
                </Card>
              );
            })}
          </YStack>
        )}

        <YStack gap="$3">
          <SectionTitle>
            已連結的夥伴{connectionItems.length > 0 ? ` · ${connectionItems.length} 人` : ""}
          </SectionTitle>
          {connectionItems.length === 0 ? (
            <EmptyState icon="connections" text="尚未與任何人建立連結" />
          ) : (
            connectionItems.map(renderConnectionCard)
          )}
        </YStack>
      </YStack>
    );
  };

  const renderFollowCard = (user: IFollowUserProfile) => (
    <Card
      key={user.id}
      padding="$3"
      backgroundColor="$background"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <XStack alignItems="center" gap="$3">
        <UserAvatar name={user.name} photoURL={user.photoURL} />
        <YStack flex={1}>
          <Text
            fontSize={14}
            fontWeight="500"
            color="$color"
            numberOfLines={1}
            onPress={() => router.push(`/users/${getUserIdentifier(user)}`)}
          >
            {user.name}
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
            取消關注
          </Text>
        </Button>
      </XStack>
    </Card>
  );

  const renderPracticeCard = (practice: IFollowPracticeProfile) => (
    <Card
      key={practice.id}
      padding="$3"
      backgroundColor="$background"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <XStack alignItems="center" gap="$3">
        <UserAvatar name={practice.ownerName} photoURL={practice.ownerPhotoURL} />
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
            取消關注
          </Text>
        </Button>
      </XStack>
    </Card>
  );

  const renderFollowing = () => {
    if (isFollowingLoading) return <LoadingState />;

    return (
      <YStack gap="$5">
        <YStack gap="$3">
          <SectionTitle>我關注的</SectionTitle>
          <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
            {(["users", "practices"] as const).map((value) => (
              <YStack
                key={value}
                flex={1}
                alignItems="center"
                paddingVertical="$3"
                borderBottomWidth={2}
                borderBottomColor={followTab === value ? colors.primary.base : "transparent"}
                onPress={() => setFollowTab(value)}
              >
                <Text
                  fontSize={14}
                  fontWeight="600"
                  color={followTab === value ? colors.primary.base : "$color"}
                  opacity={followTab === value ? 1 : 0.5}
                >
                  {value === "users" ? "使用者" : "實踐"}
                </Text>
              </YStack>
            ))}
          </XStack>

          {followTab === "users" ? (
            <YStack gap="$3">
              {followedUsers.length === 0 ? (
                <EmptyState icon="following" text="尚未關注任何使用者" />
              ) : (
                followedUsers.map(({ user }) => (user ? renderFollowCard(user) : null))
              )}
            </YStack>
          ) : (
            <YStack gap="$3">
              {followedPractices.length === 0 ? (
                <EmptyState icon="following" text="尚未關注任何實踐" />
              ) : (
                followedPractices.map(({ practice }) =>
                  practice ? renderPracticeCard(practice) : null
                )
              )}
            </YStack>
          )}
        </YStack>

        <YStack gap="$3">
          <SectionTitle>
            關注我的{followerItems.length > 0 ? ` · ${followerItems.length} 人` : ""}
          </SectionTitle>
          {followerItems.length === 0 ? (
            <EmptyState icon="following" text="目前還沒有人關注你" />
          ) : (
            followerItems.map((user) => (
              <Card
                key={user.id}
                padding="$3"
                backgroundColor="$background"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <XStack alignItems="center" gap="$3">
                  <UserAvatar name={user.name} photoURL={user.photoURL} />
                  <YStack flex={1}>
                    <Text
                      fontSize={14}
                      fontWeight="500"
                      color="$color"
                      numberOfLines={1}
                      onPress={() => router.push(`/users/${getUserIdentifier(user)}`)}
                    >
                      {user.name}
                    </Text>
                    {user.bio && (
                      <Text fontSize={12} color="$color" opacity={0.5} numberOfLines={1}>
                        {user.bio}
                      </Text>
                    )}
                  </YStack>
                </XStack>
              </Card>
            ))
          )}
        </YStack>
      </YStack>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <YStack
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor={colors.basic[100]}
            alignItems="center"
            justifyContent="center"
          >
            <Link2 size={18} color={colors.primary.base} />
          </YStack>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              社交
            </Text>
            <Text fontSize={13} color="$color" opacity={0.6}>
              管理夥伴連結與關注名單
            </Text>
          </YStack>
        </XStack>

        <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
          {renderTabButton("connections", "連結")}
          {renderTabButton("following", "關注")}
        </XStack>

        <ScrollView
          flex={1}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
        >
          {tab === "connections" ? renderConnections() : renderFollowing()}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}

function LoadingState() {
  return (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$3">
      <Spinner size="large" color={colors.primary.base} />
      <Text fontSize={14} color="$color" opacity={0.55}>
        載入中...
      </Text>
    </YStack>
  );
}
