import { useCopyPractice } from "@daodao/api";
import ChartColumnIncreasingSvg from "@daodao/assets/images/icon/chart-column-increasing.svg";
import DialogOutlineSvg from "@daodao/assets/images/icon/dialog-outline.svg";
import FlagOutlineSvg from "@daodao/assets/images/icon/flag-outline.svg";
import TagSolidSvg from "@daodao/assets/images/icon/tag-solid.svg";
import TelescopeSvg from "@daodao/assets/images/icon/telescope.svg";
import { ChevronDown, ChevronLeft, ChevronUp, Copy, MoreHorizontal } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
import { ScrollView, Text, View, XStack, YStack } from "tamagui";
import { CheckInList } from "@/components";
import { CircularProgress } from "@/components/practice/shared/circular-progress";
import { ExecutionDurationCard } from "@/components/practice/shared/execution-duration-card";
import { ExecutionTimingCard } from "@/components/practice/shared/execution-timing-card";
import { LottieEmoji } from "@/components/reactions/LottieEmoji";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PICKER_REACTIONS, type ReactionTypeType } from "@/constants/reaction-type";
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
import { useMobileTranslation } from "@/i18n";
import { runWithErrorAlert } from "@/utils/api-error";
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
  const t = useMobileTranslation("mobile.practiceDetail");
  // 複製 / 也來練習 相關文案在 practice namespace（對齊 product）
  const practiceT = useMobileTranslation("practice");
  const {
    id,
    title,
    status,
    description,
    practiceAction,
    startDate,
    endDate,
    tags,
    frequencyMinDays,
    frequencyMaxDays,
    sessionDurationMinutes,
    user,
  } = practice;
  const { copyPractice } = useCopyPractice();

  const [activeTab, setActiveTab] = useState<PracticeTab>("comments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [browseActivityOpen, setBrowseActivityOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

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
      await runWithErrorAlert(
        async () => {
          const isSelected = currentUserReaction === type;
          if (isSelected) {
            await removeReaction("practice", id);
          } else {
            await upsertReaction("practice", id, type);
          }
          await mutateReactions();
        },
        { title: t("error_title"), fallbackMessage: t("operation_failed") }
      );
    },
    [currentUserReaction, id, mutateReactions, t]
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
      Alert.alert(t("error_title"), t("operation_failed"));
    }
    setMenuOpen(false);
  }, [isFollowing, id, mutateFollow, t]);

  const handleReport = useCallback(() => {
    setMenuOpen(false);
    Linking.openURL(TALLY_REPORT_URL);
  }, []);

  const handleBrowseActivity = useCallback(() => {
    setMenuOpen(false);
    setBrowseActivityOpen(true);
  }, []);

  const handleCopyPractice = useCallback(async () => {
    setMenuOpen(false);
    if (isCopying) return;
    try {
      setIsCopying(true);
      const result = await copyPractice(id);
      router.push(`/practices/copy-success?practiceId=${result.id}` as never);
    } catch {
      Alert.alert(t("error_title"), practiceT("copy_failed"));
    } finally {
      setIsCopying(false);
    }
  }, [copyPractice, id, isCopying, router, t, practiceT]);

  // ── Derived ──
  const taskStatus = status === "active" ? "in-progress" : "completed";

  // 公開檢視的 prop 沒有 durationDays / progressPercentage，改由起訖日期推導（對齊 owner 卡片呈現）
  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return 0;
    return Math.max(0, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const progress = useMemo(() => {
    if (status === "completed") return 100;
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return 0;
    return Math.min(100, Math.max(0, Math.round(((Date.now() - s) / (e - s)) * 100)));
  }, [status, startDate, endDate]);

  const statusInfo = getStatusConfig(taskStatus);
  const frequency =
    frequencyMinDays === frequencyMaxDays
      ? String(frequencyMinDays ?? "")
      : `${frequencyMinDays}-${frequencyMaxDays}`;

  // Browse activity text (matches product logic)
  const browseActivityText = (() => {
    if (reactors.length > 0) {
      const firstName = reactors[0]?.name;
      return reactors.length > 1
        ? t("browse_with_others", { name: firstName ?? "", count: reactors.length - 1 })
        : firstName;
    }
    if (currentUserReaction) {
      return totalCount > 1 ? t("you_with_others", { count: totalCount - 1 }) : t("you");
    }
    if (totalCount > 0) {
      return firstReactorName
        ? totalCount > 1
          ? t("browse_with_others", { name: firstReactorName, count: totalCount - 1 })
          : firstReactorName
        : t("people_count", { count: totalCount });
    }
    return t("view_browse_activity");
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.veryLightGray }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          flex={1}
          backgroundColor={colors.background.veryLightGray}
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
                <Badge
                  backgroundColor={taskStatus === "completed" ? "#DBF9FF" : colors.primary.base}
                  borderWidth={taskStatus === "completed" ? 1 : 0}
                  borderColor={taskStatus === "completed" ? colors.logo.cyan : "transparent"}
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                >
                  <Text
                    fontSize={12}
                    color={taskStatus === "completed" ? colors.text.dark : "white"}
                    fontWeight="500"
                  >
                    {statusInfo.label}
                  </Text>
                </Badge>
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
                      onPress={handleCopyPractice}
                      disabled={isCopying}
                      justifyContent="flex-start"
                      paddingHorizontal="$4"
                      paddingVertical="$3"
                    >
                      <XStack gap="$3" alignItems="center">
                        <Copy size={18} color="#295E5C" />
                        <Text fontSize={14} color="#295E5C">
                          {practiceT("action_copy")}
                        </Text>
                      </XStack>
                    </Button>
                    <Button
                      chromeless
                      onPress={handleReport}
                      justifyContent="flex-start"
                      paddingHorizontal="$4"
                      paddingVertical="$3"
                    >
                      <XStack gap="$3" alignItems="center">
                        <FlagOutlineSvg width={18} height={18} color="#295E5C" />
                        <Text fontSize={14} color="#295E5C">
                          {t("report")}
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
                        <TelescopeSvg
                          width={18}
                          height={18}
                          color={isFollowing ? colors.primary.base : "#295E5C"}
                        />
                        <Text fontSize={14} color={isFollowing ? colors.primary.base : "#295E5C"}>
                          {isFollowing ? t("unfollow") : t("follow")}
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
                        <ChartColumnIncreasingSvg width={18} height={18} color="#295E5C" />
                        <Text fontSize={14} color="#295E5C">
                          {t("browse_activity")}
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
              {/* Progress ring (matches owner) */}
              <View style={styles.progressRing}>
                <CircularProgress
                  value={progress}
                  size={60}
                  strokeWidth={4}
                  backgroundColor={colors.background.gray}
                />
              </View>

              {/* Creator info */}
              {user && (
                <XStack alignItems="center" gap="$2" marginBottom="$3" paddingRight={72}>
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
                <Text
                  fontSize={15}
                  fontWeight="500"
                  color={colors.text.dark}
                  marginBottom="$3"
                  paddingRight={user ? 0 : 72}
                >
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
                      backgroundColor={colors.background.veryLightBlue}
                      paddingHorizontal="$2"
                      paddingVertical={3}
                      borderRadius={4}
                      alignItems="center"
                      gap="$1"
                    >
                      <TagSolidSvg width={18} height={18} color={colors.background.lightCyan} />
                      <Text fontSize={14} color={colors.text.dark}>
                        {tag}
                      </Text>
                    </XStack>
                  ))}
                </XStack>
              )}

              {/* ── Divider ── */}
              <View style={styles.divider} />

              {/* ── 也來練習 / Copy practice (non-owner affordance, matches product) ── */}
              <Button
                width="100%"
                height={40}
                backgroundColor="transparent"
                borderWidth={1}
                borderColor={colors.logo.cyan}
                borderRadius="$full"
                marginBottom="$3"
                disabled={isCopying}
                opacity={isCopying ? 0.6 : 1}
                pressStyle={{ opacity: 0.9 }}
                onPress={handleCopyPractice}
              >
                <XStack alignItems="center" gap="$2">
                  <Copy size={16} color={colors.text.dark} />
                  <Text fontSize={14} fontWeight="500" color={colors.text.dark}>
                    {isCopying ? practiceT("action_copying") : practiceT("action_also_practice")}
                  </Text>
                </XStack>
              </Button>

              {/* ── "更多資訊" expandable (matches product) ── */}
              <Pressable onPress={() => setInfoExpanded((v) => !v)} style={styles.moreInfoButton}>
                <Text fontSize={14} color="#9FB5B8">
                  {t("more_info")}
                </Text>
                {infoExpanded ? (
                  <ChevronUp size={16} color="#9FB5B8" />
                ) : (
                  <ChevronDown size={16} color="#9FB5B8" />
                )}
              </Pressable>

              {infoExpanded && (
                <XStack gap="$3" marginBottom="$3">
                  <View style={{ flex: 1 }}>
                    <ExecutionTimingCard executionTiming={[]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ExecutionDurationCard
                      durationDays={durationDays}
                      startDate={startDate ?? null}
                      showRemaining
                    />
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
                        <LottieEmoji type={type} size={16} play={false} />
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
                    <DialogOutlineSvg width={22} height={22} color={colors.text.dark} />
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
              checkinCount={checkIns?.length}
            />

            {/* ── Tab content ── */}
            {activeTab === "comments" && <CommentSection targetType="practice" targetId={id} />}

            {activeTab === "checkins" &&
              (checkInsError ? (
                <YStack alignItems="center" paddingVertical="$8">
                  <Text color="rgba(0,0,0,0.4)" fontSize={14}>
                    {t("checkins_load_failed")}
                  </Text>
                </YStack>
              ) : (
                <CheckInList
                  checkIns={checkIns || []}
                  emptyText={t("empty_checkins")}
                  practiceId={id}
                />
              ))}

            {activeTab === "resources" && (
              <YStack paddingVertical="$4">
                <Text color="#9FB5B8" fontSize={14}>
                  {t("empty_resources")}
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
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressRing: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
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
    paddingVertical: 16,
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
