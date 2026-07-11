import { BarChart3, MessageCircle, Telescope } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet } from "react-native";
import { Sheet, Text, View, XStack, YStack } from "tamagui";
import { LottieEmoji } from "@/components/reactions/LottieEmoji";
import { Button } from "@/components/ui/button";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { colors } from "@/generated/design-tokens";
import { followTarget, unfollowTarget, useFollowStatus } from "@/hooks/useFollow";
import { useMobileTranslation } from "@/i18n";
import { extractApiErrorMessage } from "@/utils/api-error";
import { formatRelativeTime } from "@/utils/format-time";

interface IReactor {
  userId: string;
  name: string;
  photoURL?: string | null;
  reactionType: string;
  reactedAt: string;
}

interface BrowseActivitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentCount: number;
  reactors: IReactor[];
  /** 瀏覽次數（打卡詳情頁固定為 0，對齊 product） */
  viewCount?: number;
}

type ActivityTab = "data" | "echo";

/** 單一反應者列（含追蹤按鈕），對齊 product 的 FollowerRow */
function FollowerRow({ reactor }: { reactor: IReactor }) {
  const t = useMobileTranslation("mobile.practiceDetail");
  const { isFollowing, mutate } = useFollowStatus("user", reactor.userId);
  const [localOverride, setLocalOverride] = useState<boolean | null>(null);
  const following = localOverride ?? isFollowing;
  const reactionType = reactor.reactionType as ReactionTypeType;

  const handleToggle = async () => {
    setLocalOverride(!following);
    try {
      if (following) {
        await unfollowTarget("user", reactor.userId);
      } else {
        await followTarget("user", reactor.userId);
      }
      await mutate();
    } catch (error) {
      setLocalOverride(following);
      Alert.alert(t("error_title"), extractApiErrorMessage(error, t("operation_failed")));
    }
  };

  return (
    <XStack alignItems="center" gap="$3" paddingVertical="$3">
      <View>
        <View style={styles.avatar}>
          {reactor.photoURL ? (
            <Image source={{ uri: reactor.photoURL }} style={styles.avatarImage} />
          ) : (
            <Text fontSize={14} fontWeight="500" color={colors.text.dark}>
              {reactor.name.slice(0, 1)}
            </Text>
          )}
        </View>
        {/* 反應徽章（右下角） */}
        <View style={styles.reactionBadge}>
          <LottieEmoji type={reactionType} size={16} play={false} />
        </View>
      </View>
      <YStack flex={1} minWidth={0}>
        <Text fontSize={14} fontWeight="500" color={colors.text.dark} numberOfLines={1}>
          {reactor.name}
        </Text>
        <Text fontSize={12} color={colors.gray.mid}>
          {formatRelativeTime(reactor.reactedAt)}
        </Text>
      </YStack>
      <Button
        size="$2"
        borderRadius="$full"
        paddingHorizontal="$4"
        backgroundColor={following ? "transparent" : colors.logo.cyan}
        borderWidth={following ? 1 : 0}
        borderColor={colors.gray.light}
        pressStyle={{ opacity: 0.85 }}
        onPress={handleToggle}
      >
        <Text
          fontSize={14}
          fontWeight="500"
          color={following ? colors.text.dark : colors.basic.white}
        >
          {following ? t("unfollow") : t("follow")}
        </Text>
      </Button>
    </XStack>
  );
}

export function BrowseActivitySheet({
  open,
  onOpenChange,
  commentCount,
  reactors,
  viewCount = 0,
}: BrowseActivitySheetProps) {
  const t = useMobileTranslation("mobile.practiceDetail");
  const tCommon = useMobileTranslation("common");
  const [tab, setTab] = useState<ActivityTab>("data");
  const [reactionFilter, setReactionFilter] = useState<"all" | ReactionTypeType>("all");

  const reactionCounts = reactors.reduce<Record<string, number>>((acc, reactor) => {
    acc[reactor.reactionType] = (acc[reactor.reactionType] || 0) + 1;
    return acc;
  }, {});
  const uniqueReactions = [...new Set(reactors.map((r) => r.reactionType))] as ReactionTypeType[];
  const filteredReactors =
    reactionFilter === "all" ? reactors : reactors.filter((r) => r.reactionType === reactionFilter);

  const dataRows = [
    {
      key: "views",
      icon: <Telescope size={20} color={colors.gray.mid} />,
      label: t("activity_views"),
      count: viewCount,
    },
    {
      key: "comments",
      icon: <MessageCircle size={20} color={colors.gray.mid} />,
      label: tCommon("comments"),
      count: commentCount,
    },
    {
      key: "echo",
      icon: <BarChart3 size={20} color={colors.gray.mid} />,
      label: t("activity_echo"),
      count: reactors.length,
    },
  ];

  // Lazy mount: Tamagui Sheet crashes with "setValue of undefined" when mounted with open=false
  if (!open) {
    return null;
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode="fit"
      dismissOnSnapToBottom
      zIndex={100001}
    >
      <Sheet.Overlay
        backgroundColor="rgba(0, 0, 0, 0.4)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
        paddingBottom="$6"
      >
        <Sheet.Handle backgroundColor="$borderColor" />

        <Text
          fontSize={18}
          fontWeight="600"
          color={colors.text.dark}
          paddingHorizontal="$4"
          paddingTop="$3"
        >
          {t("browse_activity")}
        </Text>

        {/* 分頁：數據 / 回響 */}
        <XStack
          marginHorizontal="$4"
          marginTop="$3"
          borderBottomWidth={1}
          borderBottomColor={colors.gray.light}
        >
          {(["data", "echo"] as const).map((currentTab) => {
            const isActive = tab === currentTab;
            return (
              <View
                key={currentTab}
                flex={1}
                alignItems="center"
                paddingVertical="$3"
                borderBottomWidth={2}
                borderBottomColor={isActive ? colors.logo.cyan : "transparent"}
                onPress={() => setTab(currentTab)}
                pressStyle={{ opacity: 0.7 }}
              >
                <Text
                  fontSize={14}
                  fontWeight="500"
                  color={isActive ? colors.logo.cyan : colors.gray.mid}
                >
                  {currentTab === "data" ? t("activity_data") : t("activity_echo")}
                </Text>
              </View>
            );
          })}
        </XStack>

        {tab === "data" && (
          <YStack paddingHorizontal="$4" marginTop="$2">
            {dataRows.map((row, index) => (
              <XStack
                key={row.key}
                alignItems="center"
                gap="$3"
                paddingVertical="$4"
                borderTopWidth={index === 0 ? 0 : 1}
                borderTopColor={colors.gray.light}
              >
                {row.icon}
                <Text flex={1} fontSize={14} color={colors.text.dark}>
                  {row.label}
                </Text>
                <Text fontSize={14} fontWeight="500" color={colors.text.dark}>
                  {row.count}
                </Text>
              </XStack>
            ))}
          </YStack>
        )}

        {tab === "echo" && (
          <YStack>
            {/* 反應篩選 chips */}
            {reactors.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContent}
              >
                <FilterChip
                  active={reactionFilter === "all"}
                  onPress={() => setReactionFilter("all")}
                  label={`${t("activity_all")} ${reactors.length}`}
                />
                {uniqueReactions.map((reaction) => (
                  <FilterChip
                    key={reaction}
                    active={reactionFilter === reaction}
                    onPress={() => setReactionFilter(reaction)}
                    emoji={reaction}
                    label={String(reactionCounts[reaction] ?? 0)}
                  />
                ))}
              </ScrollView>
            )}

            {/* fit 模式下用 maxHeight 讓長名單內捲，短名單則貼合內容 */}
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {filteredReactors.length > 0 ? (
                filteredReactors.map((reactor) => (
                  <FollowerRow
                    key={`${reactor.userId}-${reactor.reactionType}`}
                    reactor={reactor}
                  />
                ))
              ) : (
                <Text textAlign="center" color={colors.gray.mid} fontSize={14} paddingVertical="$6">
                  {t("activity_no_records")}
                </Text>
              )}
            </ScrollView>
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}

/** 反應篩選 chip（全部 / 各反應），對齊 product 的 filter tab */
function FilterChip({
  active,
  onPress,
  label,
  emoji,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  emoji?: ReactionTypeType;
}) {
  return (
    <XStack
      alignItems="center"
      gap="$1.5"
      paddingHorizontal="$3"
      paddingVertical="$2.5"
      borderBottomWidth={2}
      borderBottomColor={active ? colors.logo.cyan : "transparent"}
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
    >
      {emoji && <LottieEmoji type={emoji} size={18} play={false} />}
      <Text fontSize={14} fontWeight="500" color={active ? colors.logo.cyan : colors.gray.mid}>
        {label}
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8FAF9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reactionBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  filterScroll: {
    flexGrow: 0,
    marginHorizontal: 16,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E4EAE9",
  },
  filterContent: {
    alignItems: "center",
  },
  list: {
    // 限制名單高度，超出才內捲，讓內容落在 60% sheet 內
    maxHeight: 260,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
