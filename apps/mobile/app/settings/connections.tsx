import {
  type IConnectionItem as ApiConnectionItem,
  type IConnectionRequest as ApiConnectionRequest,
  disconnectUser,
  respondConnectionRequest,
  useConnections,
  useIncomingConnectionRequests,
  useOutgoingConnectionRequests,
  withdrawConnectionRequest,
} from "@daodao/api";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

interface IConnectionUser {
  id: string;
  name: string;
  photoURL?: string;
  bio?: string;
  identifier?: string;
}

interface IConnectionRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  intent?: string;
  requester?: IConnectionUser;
  receiver?: IConnectionUser;
}

interface IConnection {
  id: string;
  userAId: string;
  userBId: string;
  partner?: IConnectionUser;
}

const mapConnectionUser = (
  id: string,
  nickname: string | null,
  photoURL?: string | null
): IConnectionUser => ({
  id,
  identifier: id,
  name: nickname ?? "User",
  photoURL: photoURL ?? undefined,
});

const mapIncomingRequest = (request: ApiConnectionRequest): IConnectionRequest => ({
  id: String(request.requestId),
  requesterId: request.requesterExternalId,
  receiverId: request.receiverExternalId,
  intent: request.intent ?? undefined,
  requester: mapConnectionUser(
    request.requesterExternalId,
    request.requesterNickname,
    request.requesterPhotoUrl
  ),
});

const mapOutgoingRequest = (request: ApiConnectionRequest): IConnectionRequest => ({
  id: String(request.requestId),
  requesterId: request.requesterExternalId,
  receiverId: request.receiverExternalId,
  intent: request.intent ?? undefined,
  receiver: mapConnectionUser(
    request.receiverExternalId,
    request.receiverNickname,
    request.receiverPhotoUrl
  ),
});

const mapConnection = (connection: ApiConnectionItem): IConnection => ({
  id: String(connection.connectionId),
  userAId: "",
  userBId: String(connection.userId),
  partner: mapConnectionUser(connection.externalId, connection.nickname, connection.photoUrl),
});

export default function ConnectionsSettingsScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.connectionsSettings");
  const tCommon = useMobileTranslation("common");

  const {
    data: incomingRequests,
    isLoading: loadingIncoming,
    mutate: mutateIncoming,
  } = useIncomingConnectionRequests();
  const {
    data: outgoingRequests,
    isLoading: loadingOutgoing,
    mutate: mutateOutgoing,
  } = useOutgoingConnectionRequests();
  const {
    data: connections,
    isLoading: loadingConnections,
    mutate: mutateConnections,
  } = useConnections();

  const isLoading = loadingIncoming || loadingOutgoing || loadingConnections;
  const incoming = incomingRequests?.data.map(mapIncomingRequest) ?? [];
  const outgoing = outgoingRequests?.data.map(mapOutgoingRequest) ?? [];
  const conns = connections?.data.map(mapConnection) ?? [];
  const hasPending = incoming.length > 0 || outgoing.length > 0;

  const refreshAll = () => Promise.all([mutateIncoming(), mutateOutgoing(), mutateConnections()]);

  const handleAccept = async (requestId: string) => {
    try {
      await respondConnectionRequest(requestId, "accept");
      await refreshAll();
    } catch {
      Alert.alert(t("errorTitle"), t("operationFailed"));
    }
  };

  const handleIgnore = (requestId: string, name: string) => {
    Alert.alert(t("ignoreTitle"), t("ignoreMessage", { name }), [
      { text: t("keep"), style: "cancel" },
      {
        text: t("ignore"),
        onPress: async () => {
          try {
            await respondConnectionRequest(requestId, "reject");
            await mutateIncoming();
          } catch {
            Alert.alert(t("errorTitle"), t("operationFailed"));
          }
        },
      },
    ]);
  };

  const handleWithdraw = (requestId: string, name: string) => {
    Alert.alert(t("withdrawTitle"), t("withdrawMessage", { name }), [
      { text: t("keep"), style: "cancel" },
      {
        text: t("withdraw"),
        onPress: async () => {
          try {
            await withdrawConnectionRequest(requestId);
            await mutateOutgoing();
          } catch {
            Alert.alert(t("errorTitle"), t("operationFailed"));
          }
        },
      },
    ]);
  };

  const handleDisconnect = (userId: string, name: string) => {
    Alert.alert(t("disconnectTitle"), t("disconnectMessage", { name }), [
      { text: t("keep"), style: "cancel" },
      {
        text: t("disconnect"),
        style: "destructive",
        onPress: async () => {
          try {
            await disconnectUser(userId);
            await mutateConnections();
          } catch {
            Alert.alert(t("errorTitle"), t("operationFailed"));
          }
        },
      },
    ]);
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

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          {isLoading ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text fontSize={14} color="$color" opacity={0.5}>
                {t("loading")}
              </Text>
            </YStack>
          ) : (
            <YStack gap="$5">
              {hasPending && (
                <YStack gap="$3">
                  <Text
                    fontSize={13}
                    fontWeight="600"
                    color="$color"
                    opacity={0.5}
                    paddingLeft="$1"
                  >
                    {t("pendingRequests")}
                  </Text>
                  {incoming.map((req) => {
                    const user = req.requester;
                    const name = user?.name ?? t("fallbackUser");
                    return (
                      <Card
                        key={req.id ?? `in-${req.requesterId}`}
                        padding="$3"
                        backgroundColor="$background"
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <YStack gap="$3">
                          <XStack alignItems="center" gap="$3">
                            <Avatar circular size="$4">
                              {user?.photoURL ? (
                                <Avatar.Image source={{ uri: user.photoURL }} />
                              ) : (
                                <Avatar.Fallback backgroundColor={colors.primary.palest}>
                                  <Text fontSize={14} fontWeight="600" color={colors.primary.base}>
                                    {name.slice(0, 1)}
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
                                  onPress={() =>
                                    router.push(`/users/${user?.identifier ?? user?.id}`)
                                  }
                                >
                                  {name}
                                </Text>
                              </Text>
                              {user?.bio && (
                                <Text fontSize={12} color="$color" opacity={0.5} numberOfLines={1}>
                                  {user.bio}
                                </Text>
                              )}
                            </YStack>
                          </XStack>
                          {req.intent && (
                            <YStack
                              padding="$2"
                              backgroundColor={colors.basic[100]}
                              borderRadius="$sm"
                            >
                              <Text fontSize={12} color="$color" opacity={0.7}>
                                「{req.intent}」
                              </Text>
                            </YStack>
                          )}
                          <XStack gap="$2">
                            <Button
                              flex={1}
                              size="$3"
                              backgroundColor={colors.primary.base}
                              onPress={() => handleAccept(req.id)}
                            >
                              <Text fontSize={13} color={colors.basic.white} fontWeight="500">
                                {t("accept")}
                              </Text>
                            </Button>
                            <Button
                              flex={1}
                              size="$3"
                              backgroundColor="transparent"
                              borderWidth={1}
                              borderColor="$borderColor"
                              onPress={() => handleIgnore(req.id, name)}
                            >
                              <Text fontSize={13} color="$color">
                                {t("ignore")}
                              </Text>
                            </Button>
                          </XStack>
                        </YStack>
                      </Card>
                    );
                  })}
                  {outgoing.map((req) => {
                    const user = req.receiver;
                    const name = user?.name ?? t("fallbackUser");
                    return (
                      <Card
                        key={req.id ?? `out-${req.receiverId}`}
                        padding="$3"
                        backgroundColor="$background"
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <XStack alignItems="center" gap="$3">
                          <Avatar circular size="$4">
                            {user?.photoURL ? (
                              <Avatar.Image source={{ uri: user.photoURL }} />
                            ) : (
                              <Avatar.Fallback backgroundColor={colors.primary.palest}>
                                <Text fontSize={14} fontWeight="600" color={colors.primary.base}>
                                  {name.slice(0, 1)}
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
                                onPress={() => router.push(`/users/${user?.identifier ?? user?.id}`)}
                              >
                                {name}
                              </Text>
                            </Text>
                            <Text fontSize={12} color="$color" opacity={0.5}>
                              {t("waitingResponse")}
                            </Text>
                          </YStack>
                          <Button
                            size="$3"
                            backgroundColor="transparent"
                            borderWidth={1}
                            borderColor="$borderColor"
                            onPress={() => handleWithdraw(req.id, name)}
                          >
                            <Text fontSize={12} color="$color">
                              {t("withdraw")}
                            </Text>
                          </Button>
                        </XStack>
                      </Card>
                    );
                  })}
                </YStack>
              )}

              <YStack gap="$3">
                <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                  {t("connectedPartnersCount", { count: conns.length })}
                </Text>
                {conns.length === 0 ? (
                  <YStack alignItems="center" paddingVertical="$8">
                    <Text fontSize={14} color="$color" opacity={0.5}>
                      {t("empty")}
                    </Text>
                  </YStack>
                ) : (
                  conns.map((conn) => {
                    const partner = conn.partner;
                    const name = partner?.name ?? t("fallbackUser");
                    const partnerId = partner?.identifier ?? partner?.id ?? conn.userAId;
                    return (
                      <Card
                        key={conn.id ?? `c-${conn.userAId}-${conn.userBId}`}
                        padding="$3"
                        backgroundColor="$background"
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <XStack alignItems="center" gap="$3">
                          <Avatar circular size="$4">
                            {partner?.photoURL ? (
                              <Avatar.Image source={{ uri: partner.photoURL }} />
                            ) : (
                              <Avatar.Fallback backgroundColor={colors.primary.palest}>
                                <Text fontSize={14} fontWeight="600" color={colors.primary.base}>
                                  {name.slice(0, 1)}
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
                                onPress={() => router.push(`/users/${partnerId}`)}
                              >
                                {name}
                              </Text>
                            </Text>
                            {partner?.bio && (
                              <Text fontSize={12} color="$color" opacity={0.5} numberOfLines={1}>
                                {partner.bio}
                              </Text>
                            )}
                          </YStack>
                          <Button
                            size="$3"
                            backgroundColor="transparent"
                            borderWidth={1}
                            borderColor="$borderColor"
                            onPress={() => handleDisconnect(partnerId, name)}
                          >
                            <Text fontSize={12} color="$color">
                              {t("disconnect")}
                            </Text>
                          </Button>
                        </XStack>
                      </Card>
                    );
                  })
                )}
              </YStack>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
