import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Tag,
  Telescope,
} from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, Text, View, XStack, YStack } from "tamagui";
import { CheckInList } from "@/components";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import {
  PICKER_REACTIONS,
  REACTION_CONFIG,
  type ReactionTypeType,
} from "@/constants/reaction-type";
import { getStatusConfig } from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import { useComments } from "@/hooks/useComments";
import { followTarget, unfollowTarget, useFollowStatus } from "@/hooks/useFollow";
import { useCheckIns } from "@/hooks/usePractices";
import {
  removeReaction,
  upsertReaction,
  useReactions,
  useReactionsList,
} from "@/hooks/useReactions";
import { BrowseActivitySheet } from "./BrowseActivitySheet";
import { CommentSection } from "./CommentSection";
import { type PracticeTab, PracticeTabBar } from "./PracticeTabBar";

interface PublicPracticeViewProps {
  practice: {
    id: string;
    title: string;
    status: string;
    description?: string;
    practiceAction?: string;
    startDate?: string | null;
    endDate?: string | null;
    tags?: string[];
    frequencyMinDays?: number | null;
    frequencyMaxDays?: number | null;
    sessionDurationMinutes?: number | null;
    user?: {
      id: string;
      name: string;
      photoUrl?: string | null;
    };
  };
  onRefresh: () => Promise<void>;
}

const TALLY_REPORT_URL = "https://tally.so/r/BzGQy4";

export function PublicPracticeView({ practice, onRefresh }: PublicPracticeViewProps) {
  const router = useRouter();
  const {
    id,
    title,
    status,
    description,
    practiceAction,
    tags,
    frequencyMinDays,
    frequencyMaxDays,
    sessionDurationMinutes,
    user,
  } = practice;

  const [activeTab, setActiveTab] = useState<PracticeTab>("comments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [browseActivityOpen, setBrowseActivityOpen] = useState(false);

  // ── Data ──
  const {
    currentUserReaction,
    totalCount,
    displayReactions,
    mutate: mutateReactions,
  } = useReactions("practice", id);
  const { items: reactors, firstReactorName } = useReactionsList("practice", id);
  const { comments } = useComments("practice", id);
  const { isFollowing, mutate: mutateFollow } = useFollowStatus("practice", id);
  const { checkIns, error: checkInsError } = useCheckIns(id);

  // ── Handlers ──
  const handleReactionToggle = useCallback(
    async (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      if (isSelected) {
        await removeReaction("practice", id);
      } else {
        await upsertReaction("practice", id, type);
      }
      await mutateReactions();
    },
    [currentUserReaction, id, mutateReactions]
  );

  const handleToggleFollow = useCallback(async () => {
    try {
      if (isFollowing) {
        await unfollowTarget("practice", id);
      } else {
        await followTarget("practice", id);
      }
      await mutateFollow();
    } catch {
      Alert.alert("錯誤", "操作失敗，請稍後再試");
    }
    setMenuOpen(false);
  }, [isFollowing, id, mutateFollow]);

  const handleReport = useCallback(() => {
    setMenuOpen(false);
    Linking.openURL(TALLY_REPORT_URL);
  }, []);

  const handleBrowseActivity = useCallback(() => {
    setMenuOpen(false);
    setBrowseActivityOpen(true);
  }, []);

  // ── Derived ──
  const taskStatus = status === "active" ? "in-progress" : "completed";
  const statusInfo = getStatusConfig(taskStatus);
  const frequency =
    frequencyMinDays === frequencyMaxDays
      ? String(frequencyMinDays ?? "")
      : `${frequencyMinDays}-${frequencyMaxDays}`;

  // Browse activity text (matches product logic)
  const browseActivityText = (() => {
    if (reactors.length > 0) {
      const firstName = reactors[0]?.name;
      return reactors.length > 1 ? `${firstName} 與其他 ${reactors.length - 1} 人` : firstName;
    }
    if (currentUserReaction) {
      return totalCount > 1 ? `你 與其他 ${totalCount - 1} 人` : "你";
    }
    if (totalCount > 0) {
      return firstReactorName
        ? totalCount > 1
          ? `${firstReactorName} 與其他 ${totalCount - 1} 人`
          : firstReactorName
        : `${totalCount} 人`;
    }
    return "觀看瀏覽活動";
  })();

  // Browse activity emoji circles
  const browseDisplayReactions =
    reactors.length > 0
      ? ([...new Set(reactors.map((r) => r.reactionType))].slice(
          0,
          PICKER_REACTIONS.length
        ) as ReactionTypeType[])
      : displayReactions.slice(0, PICKER_REACTIONS.length);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          flex={1}
          backgroundColor="$background"
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={onRefresh}
              tintColor={colors.primary.base}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Top bar: back button ── */}
          <XStack padding="$4" alignItems="center">
            <Button size="$4" circular chromeless onPress={() => router.back()}>
              <ChevronLeft size={24} color="$color" />
            </Button>
          </XStack>

          <YStack paddingHorizontal="$4">
            {/* ── Status badge + menu row (matches product) ── */}
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
              {statusInfo ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: taskStatus === "completed" ? "#6B7280" : colors.primary.base,
                    },
                  ]}
                >
                  <Text fontSize={12} color="white" fontWeight="500">
                    {statusInfo.label}
                  </Text>
                </View>
              ) : (
                <View />
              )}

              <View style={{ position: "relative" }}>
                <Button size="$3" circular chromeless onPress={() => setMenuOpen(!menuOpen)}>
                  <MoreHorizontal size={20} color="$color" />
                </Button>

                {/* Menu dropdown */}
                {menuOpen && (
                  <YStack
                    position="absolute"
                    right={0}
                    top="100%"
                    marginTop={4}
                    zIndex={20}
                    backgroundColor="white"
                    borderRadius={16}
                    paddingVertical="$2"
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.15}
                    shadowRadius={8}
                    elevation={5}
                    minWidth={140}
                  >
                    <Button
                      chromeless
                      onPress={handleReport}
                      justifyContent="flex-start"
                      paddingHorizontal="$4"
                      paddingVertical="$3"
                    >
                      <XStack gap="$3" alignItems="center">
                        <Flag size={18} color="#295E5C" />
                        <Text fontSize={14} color="#295E5C">
                          檢舉
                        </Text>
                      </XStack>
                    </Button>
                    <Button
                      chromeless
                      onPress={handleToggleFollow}
                      justifyContent="flex-start"
                      paddingHorizontal="$4"
                      paddingVertical="$3"
                    >
                      <XStack gap="$3" alignItems="center">
                        <Telescope
                          size={18}
                          color={isFollowing ? colors.primary.base : "#295E5C"}
                        />
                        <Text fontSize={14} color={isFollowing ? colors.primary.base : "#295E5C"}>
                          {isFollowing ? "取消關注" : "關注"}
                        </Text>
                      </XStack>
                    </Button>
                    <Button
                      chromeless
                      onPress={handleBrowseActivity}
                      justifyContent="flex-start"
                      paddingHorizontal="$4"
                      paddingVertical="$3"
                    >
                      <XStack gap="$3" alignItems="center">
                        <BarChart3 size={18} color="#295E5C" />
                        <Text fontSize={14} color="#295E5C">
                          瀏覽活動
                        </Text>
                      </XStack>
                    </Button>
                  </YStack>
                )}
              </View>
            </XStack>

            {/* ── Title (left-aligned, matches product h1) ── */}
            <Text
              fontSize={18}
              fontWeight="600"
              color={colors.text.dark}
              numberOfLines={2}
              marginBottom="$4"
            >
              {title}
            </Text>

            {/* ── Single overview card (matches product structure) ── */}
            <View style={styles.card}>
              {/* Creator info */}
              {user && (
                <XStack alignItems="center" gap="$2" marginBottom="$3">
                  <View style={styles.creatorAvatar}>
                    {user.photoUrl ? (
                      <Image source={{ uri: user.photoUrl }} style={styles.creatorAvatarImage} />
                    ) : (
                      <Text fontSize={12} color="#9CA3AF">
                        {(user.name ?? "?")[0]}
                      </Text>
                    )}
                  </View>
                  <Text fontSize={14} fontWeight="500" color={colors.text.dark}>
                    {user.name}
                  </Text>
                </XStack>
              )}

              {/* Action description */}
              {(practiceAction || description) && (
                <Text fontSize={15} fontWeight="500" color={colors.text.dark} marginBottom="$3">
                  {practiceAction || description}
                </Text>
              )}

              {/* Frequency + Duration (product-style stacked layout) */}
              {(frequencyMinDays || frequencyMaxDays || sessionDurationMinutes) && (
                <XStack
                  marginBottom="$3"
                  paddingBottom="$3"
                  borderBottomWidth={1}
                  borderBottomColor="#E4EAE9"
                >
                  {(frequencyMinDays || frequencyMaxDays) && (
                    <YStack width={80}>
                      <Text fontSize={12} color={colors.text.dark}>
                        一週
                      </Text>
                      <XStack alignItems="baseline" gap={2}>
                        <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                          {frequency}
                        </Text>
                        <Text fontSize={12} color={colors.text.dark}>
                          天
                        </Text>
                      </XStack>
                    </YStack>
                  )}
                  {sessionDurationMinutes && (
                    <YStack width={80}>
                      <Text fontSize={12} color={colors.text.dark}>
                        一次
                      </Text>
                      <XStack alignItems="baseline" gap={2}>
                        <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                          {sessionDurationMinutes}
                        </Text>
                        <Text fontSize={12} color={colors.text.dark}>
                          分鐘
                        </Text>
                      </XStack>
                    </YStack>
                  )}
                </XStack>
              )}

              {/* Tags */}
              {tags && tags.length > 0 && (
                <XStack flexWrap="wrap" gap="$2" marginBottom="$3">
                  {tags.map((tag) => (
                    <XStack
                      key={tag}
                      backgroundColor="#E0F4FF"
                      paddingHorizontal="$2"
                      paddingVertical={4}
                      borderRadius="$sm"
                      alignItems="center"
                      gap="$1"
                    >
                      <Tag size={14} color={colors.primary.lighter} />
                      <Text fontSize={12} color={colors.text.dark}>
                        {tag}
                      </Text>
                    </XStack>
                  ))}
                </XStack>
              )}

              {/* ── Divider ── */}
              <View style={styles.divider} />

              {/* ── "更多資訊" expandable (matches product) ── */}
              <Pressable onPress={() => setInfoExpanded((v) => !v)} style={styles.moreInfoButton}>
                <Text fontSize={14} color="#9FB5B8">
                  更多資訊
                </Text>
                {infoExpanded ? (
                  <ChevronUp size={16} color="#9FB5B8" />
                ) : (
                  <ChevronDown size={16} color="#9FB5B8" />
                )}
              </Pressable>

              {infoExpanded && (
                <XStack gap="$3" marginBottom="$3">
                  {/* Execution Timing placeholder */}
                  <View style={styles.infoCard}>
                    <Text fontSize={12} color={colors.primary.darker} marginBottom="$2">
                      執行時機
                    </Text>
                    <Text fontSize={12} color="rgba(0,0,0,0.4)">
                      尚無資料
                    </Text>
                  </View>
                  {/* Duration card */}
                  <View style={styles.infoCard}>
                    <Text fontSize={12} color={colors.primary.darker} marginBottom="$2">
                      實踐週期
                    </Text>
                    <Text fontSize={12} color="rgba(0,0,0,0.4)">
                      尚無資料
                    </Text>
                  </View>
                </XStack>
              )}

              {/* ── Browse Activity button (matches product) ── */}
              <Pressable onPress={handleBrowseActivity} style={styles.browseActivityButton}>
                {browseDisplayReactions.length > 0 && (
                  <XStack alignItems="center">
                    {browseDisplayReactions.map((type, i) => (
                      <View
                        key={type}
                        style={[styles.browseEmojiCircle, i > 0 && { marginLeft: -6 }]}
                      >
                        <Text fontSize={16}>{REACTION_CONFIG[type]?.emoji ?? "👍"}</Text>
                      </View>
                    ))}
                  </XStack>
                )}
                <Text fontSize={14} color={colors.text.dark}>
                  {browseActivityText}
                </Text>
              </Pressable>

              {/* ── Reaction bar + Comment count (matches product bottom bar) ── */}
              <View style={styles.bottomBar}>
                <View style={styles.bottomBarHalf}>
                  <ReactionPickerButton
                    selectedReaction={currentUserReaction}
                    onToggle={handleReactionToggle}
                    variant="card"
                    totalCount={totalCount}
                    displayReactions={displayReactions}
                    firstReactorName={firstReactorName}
                  />
                </View>

                <View style={styles.bottomBarDivider} />

                <Pressable style={styles.bottomBarHalf} onPress={() => setActiveTab("comments")}>
                  <XStack alignItems="center" gap="$1.5" justifyContent="center">
                    <MessageCircle size={20} color={colors.text.dark} />
                    <Text fontSize={14} fontWeight="500" color={colors.text.dark}>
                      {comments.length}
                    </Text>
                  </XStack>
                </Pressable>
              </View>
            </View>

            {/* ── Tabs (matches product) ── */}
            <PracticeTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              commentCount={comments.length}
            />

            {/* ── Tab content ── */}
            {activeTab === "comments" && <CommentSection targetType="practice" targetId={id} />}

            {activeTab === "checkins" &&
              (checkInsError ? (
                <YStack alignItems="center" paddingVertical="$8">
                  <Text color="rgba(0,0,0,0.4)" fontSize={14}>
                    無法載入打卡紀錄
                  </Text>
                </YStack>
              ) : (
                <CheckInList checkIns={checkIns || []} emptyText="尚無打卡紀錄" />
              ))}

            {activeTab === "resources" && (
              <YStack paddingVertical="$4">
                <Text color="#9FB5B8" fontSize={14}>
                  目前沒有使用資源
                </Text>
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Browse Activity Sheet — lazy mount to avoid Tamagui Sheet crash */}
      {browseActivityOpen && (
        <BrowseActivitySheet
          open={browseActivityOpen}
          onOpenChange={setBrowseActivityOpen}
          commentCount={comments.length}
          reactors={reactors}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: "hidden",
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  creatorAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E4EAE9",
    marginBottom: 8,
  },
  moreInfoButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#E6F7F9",
    borderRadius: 12,
    padding: 16,
  },
  browseActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
  },
  browseEmojiCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8FAF9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E4EAE9",
    paddingVertical: 12,
  },
  bottomBarHalf: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBarDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E4EAE9",
  },
});
