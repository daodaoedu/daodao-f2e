import DialogOutlineSvg from "@daodao/assets/images/icon/dialog-outline.svg";
import TagSolidSvg from "@daodao/assets/images/icon/tag-solid.svg";
import {
  Archive,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  X,
} from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mutate as globalMutate } from "swr";
import { ScrollView, Spinner, Text, View, XStack, YStack } from "tamagui";
import { CheckInRecordCard, CheckInSheet, CheckInStack, ShareCheckInSheet } from "@/components";
import type { ICheckInData } from "@/components/CheckInSheet";
import { DropdownMenu } from "@/components/layout/dropdown-menu";
import { BrowseActivitySheet } from "@/components/practice/detail/BrowseActivitySheet";
import { CommentSection } from "@/components/practice/detail/CommentSection";
import { type PracticeTab, PracticeTabBar } from "@/components/practice/detail/PracticeTabBar";
import { PracticeResourceListCard } from "@/components/practice/detail/practice-resource-list-card";
import { PublicPracticeView } from "@/components/practice/detail/PublicPracticeView";
import { CircularProgress } from "@/components/practice/shared/circular-progress";
import { ExecutionDurationCard } from "@/components/practice/shared/execution-duration-card";
import { ExecutionTimingCard } from "@/components/practice/shared/execution-timing-card";
import { LottieEmoji } from "@/components/reactions/LottieEmoji";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ExecutionTiming, PracticeTimePeriodToExecutionTimingMap } from "@/constants/practice-form";
import { PICKER_REACTIONS, type ReactionTypeType } from "@/constants/reaction-type";
import { colors } from "@/generated/design-tokens";
import { useComments } from "@/hooks/useComments";
import {
  removeReaction,
  upsertReaction,
  useReactions,
  useReactionsList,
} from "@/hooks/useReactions";
import { useCheckIn, useCheckIns, usePractice } from "@/hooks/usePractices";
import type { IShowcasePractice } from "@/hooks/useShowcaseFeed";
import { useMobileTranslation } from "@/i18n";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api-client";

// 狀態標籤配置
const statusConfig: Record<
  string,
  { labelKey: string; backgroundColor: string; textColor: string }
> = {
  draft: {
    labelKey: "status_draft",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    textColor: "#666666",
  },
  "not-started": {
    labelKey: "status_not_started",
    backgroundColor: "#E0F4FF",
    textColor: "#0088CC",
  },
  "in-progress": {
    labelKey: "status_in_progress",
    backgroundColor: "#16B9B3",
    textColor: "#FFFFFF",
  },
  active: { labelKey: "status_in_progress", backgroundColor: "#16B9B3", textColor: "#FFFFFF" },
  completed: { labelKey: "status_completed", backgroundColor: "#10B981", textColor: "#FFFFFF" },
};

// API practiceTimePeriods → 表單 ExecutionTiming（含 commute）
const timePeriodToTiming: Record<string, ExecutionTiming> = {
  ...PracticeTimePeriodToExecutionTimingMap,
  commute: "commute",
};

export default function PracticeDetailScreen() {
  const { id, showcaseData } = useLocalSearchParams<{ id: string; showcaseData?: string }>();
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const detailT = useMobileTranslation("mobile.practiceDetail");
  // Status labels live under mobile.practiceCard, not the practice namespace.
  const statusT = useMobileTranslation("mobile.practiceCard");
  const { user: currentUser } = useAuth();
  const { practice, isLoading, mutate } = usePractice(id);
  const { checkIn } = useCheckIn();
  const { checkIns, checkInsData, isLoading: isLoadingCheckIns, error: checkInsError } =
    useCheckIns(id);

  // 反應 / 留言（owner 也可與自己的實踐互動，對齊 product）
  const {
    currentUserReaction,
    totalCount,
    displayReactions,
    mutate: mutateReactions,
  } = useReactions("practice", id);
  const { items: reactors, firstReactorName } = useReactionsList("practice", id);
  const { comments } = useComments("practice", id);

  const [showCheckInSheet, setShowCheckInSheet] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<PracticeTab>("comments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [browseActivityOpen, setBrowseActivityOpen] = useState(false);

  const handleCheckIn = useCallback(
    async (data: ICheckInData) => {
      if (!id) return { success: false, error: t("mobile_invalid_practice_id") };

      const result = await checkIn({ practiceId: id, note: data.description });

      if (result.success) {
        await mutate();
      } else if (result.error) {
        Alert.alert(t("mobile_checkin_failed"), result.error);
      }

      return result;
    },
    [id, checkIn, mutate, t]
  );

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const handleReactionToggle = useCallback(
    async (type: ReactionTypeType) => {
      if (currentUserReaction === type) {
        await removeReaction("practice", id);
      } else {
        await upsertReaction("practice", id, type);
      }
      await mutateReactions();
    },
    [currentUserReaction, id, mutateReactions]
  );

  const handleEdit = useCallback(() => {
    setMenuOpen(false);
    router.push(`/practices/${id}/edit` as never);
  }, [id, router]);

  const handleBrowseActivity = useCallback(() => {
    setMenuOpen(false);
    setBrowseActivityOpen(true);
  }, []);

  const handleArchive = useCallback(() => {
    setMenuOpen(false);
    Alert.alert(t("mobile_archive_title"), t("mobile_archive_message"), [
      { text: t("edit_cancel"), style: "cancel" },
      {
        text: t("mobile_archive_action"),
        onPress: async () => {
          try {
            await api.put(`/practices/${id}`, { status: "archived" });
            await Promise.all([mutate(), globalMutate("/me/practices")]);
            router.push("/settings/archived" as never);
          } catch (error) {
            const message = error instanceof Error ? error.message : t("archive_failed");
            Alert.alert(t("archive_failed"), message);
          }
        },
      },
    ]);
  }, [id, mutate, router, t]);

  const handleDelete = useCallback(() => {
    setMenuOpen(false);
    Alert.alert(t("delete_practice_title"), t("delete_practice_message"), [
      { text: t("edit_cancel"), style: "cancel" },
      {
        text: t("mobile_delete_action"),
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/practices/${id}`);
            await globalMutate("/me/practices");
            router.replace("/" as never);
          } catch (error) {
            const message = error instanceof Error ? error.message : t("delete_failed");
            Alert.alert(t("delete_failed"), message);
          }
        },
      },
    ]);
  }, [id, router, t]);

  // 頻率標籤（2-4 / 3-5 …），對齊 product
  const frequencyLabel = useMemo(() => {
    const min = practice?.frequencyMinDays;
    const max = practice?.frequencyMaxDays;
    if (min == null && max == null) return "";
    if (min === max) return String(min ?? "");
    return `${min ?? ""}-${max ?? ""}`;
  }, [practice?.frequencyMinDays, practice?.frequencyMaxDays]);

  // API practiceTimePeriods → 表單 ExecutionTiming 陣列
  const executionTiming = useMemo(
    () =>
      (practice?.practiceTimePeriods ?? [])
        .map((period) => timePeriodToTiming[period])
        .filter((timing): timing is ExecutionTiming => Boolean(timing)),
    [practice?.practiceTimePeriods]
  );

  // 瀏覽動態文字（對齊 product 邏輯）
  const browseActivityText = useMemo(() => {
    if (reactors.length > 0) {
      const firstName = reactors[0]?.name ?? "";
      if (reactors.length > 1) {
        return detailT("browse_with_others", { name: firstName, count: reactors.length - 1 });
      }
      return firstName;
    }
    if (currentUserReaction) {
      if (totalCount > 1) return detailT("you_with_others", { count: totalCount - 1 });
      return detailT("you");
    }
    if (totalCount > 0) {
      if (firstReactorName) {
        if (totalCount > 1) {
          return detailT("browse_with_others", { name: firstReactorName, count: totalCount - 1 });
        }
        return firstReactorName;
      }
      return detailT("people_count", { count: totalCount });
    }
    return detailT("view_browse_activity");
  }, [reactors, currentUserReaction, totalCount, firstReactorName, detailT]);

  const browseDisplayReactions = useMemo<ReactionTypeType[]>(() => {
    if (reactors.length > 0) {
      return [...new Set(reactors.map((r) => r.reactionType))].slice(
        0,
        PICKER_REACTIONS.length
      ) as ReactionTypeType[];
    }
    return displayReactions.slice(0, PICKER_REACTIONS.length);
  }, [reactors, displayReactions]);

  // Parse showcase data passed from 靈感 tab
  const showcasePractice = showcaseData ? (JSON.parse(showcaseData) as IShowcasePractice) : null;
  const isPublicView = showcasePractice != null && showcasePractice.user?.id !== currentUser?.id;

  // Public practice view (from 靈感 tab) — check BEFORE loading to avoid waiting for usePractice
  if (isPublicView && showcasePractice) {
    return (
      <PublicPracticeView
        practice={{
          id: showcasePractice.id,
          title: showcasePractice.title,
          status: showcasePractice.status,
          practiceAction: showcasePractice.practice_action ?? undefined,
          startDate: showcasePractice.start_date,
          endDate: showcasePractice.end_date,
          frequencyMinDays: showcasePractice.frequency_min_days,
          frequencyMaxDays: showcasePractice.frequency_max_days,
          sessionDurationMinutes: showcasePractice.session_duration_minutes,
          user: showcasePractice.user
            ? {
                id: showcasePractice.user.id,
                name: showcasePractice.user.name,
                photoUrl: showcasePractice.user.photo_url,
              }
            : undefined,
        }}
        onRefresh={async () => {}}
      />
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!practice) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Text fontSize={16} color="$color" opacity={0.6}>
            {t("mobile_practice_not_found")}
          </Text>
          <Button onPress={() => router.back()}>
            <Text>{commonT("back")}</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const progress =
    practice.progressPercentage ??
    (practice.targetDays > 0
      ? Math.round((practice.completedDays / practice.targetDays) * 100)
      : 0);

  const status = practice.status || "in-progress";
  const statusInfo = statusConfig[status] || statusConfig["in-progress"];
  const canViewSummary = status === "completed" || practice.targetDays <= practice.completedDays;
  const durationDays = practice.durationDays ?? practice.targetDays;
  const hasStats = Boolean(frequencyLabel) || practice.sessionDurationMinutes != null;

  // 依實踐狀態渲染底部主要按鈕（對齊 product：orange variant 膠囊、深色字、無圖示、h-10 高度）
  const renderFooterButton = () => {
    let label = t("mobile_checkin_action");
    let disabled = false;

    if (canViewSummary) {
      label = t("view_summary");
    } else if (practice.todayCheckedIn) {
      label = t("mobile_today_completed");
      disabled = true;
    }

    const handlePress = () => {
      if (canViewSummary) {
        router.push(`/practices/${id}/summary` as never);
        return;
      }
      setShowCheckInSheet(true);
    };

    return (
      <Button
        height={44}
        backgroundColor={colors.logo.orange}
        borderRadius="$full"
        pressStyle={{ opacity: 0.9 }}
        onPress={handlePress}
        disabled={disabled}
        opacity={disabled ? 0.6 : 1}
      >
        <Text color={colors.background.dark} fontWeight="600" fontSize={15}>
          {label}
        </Text>
      </Button>
    );
  };

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
              onRefresh={handleRefresh}
              tintColor={colors.primary.base}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Top bar: close (X) → home, aligned with product web ── */}
          <XStack padding="$4" justifyContent="flex-end" alignItems="center">
            <Button
              size="$4"
              circular
              chromeless
              onPress={() => router.replace("/" as never)}
              accessibilityLabel={commonT("close")}
            >
              <X size={20} color="$color" />
            </Button>
          </XStack>

          <YStack paddingHorizontal="$4">
            {/* ── Status badge + owner menu row (matches product) ── */}
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
              <Badge backgroundColor={statusInfo.backgroundColor}>
                <Text fontSize={14} color={statusInfo.textColor}>
                  {statusT(statusInfo.labelKey)}
                </Text>
              </Badge>

              <DropdownMenu
                open={menuOpen}
                onToggle={() => setMenuOpen((v) => !v)}
                items={[
                  {
                    key: "edit",
                    icon: <Pencil size={18} color="#295E5C" />,
                    label: t("edit_title"),
                    onPress: handleEdit,
                  },
                  {
                    key: "archive",
                    icon: <Archive size={18} color="#295E5C" />,
                    label: t("mobile_archive_action"),
                    onPress: handleArchive,
                  },
                  {
                    key: "browse",
                    icon: <BarChart3 size={18} color="#295E5C" />,
                    label: detailT("browse_activity"),
                    onPress: handleBrowseActivity,
                  },
                  {
                    key: "delete",
                    icon: <Trash2 size={18} color="#EF4444" />,
                    label: t("mobile_delete_action"),
                    color: "#EF4444",
                    onPress: handleDelete,
                  },
                ]}
              />
            </XStack>

            {/* ── Title (left-aligned, matches product h1) ── */}
            <Text
              fontSize={18}
              fontWeight="600"
              color={colors.text.dark}
              numberOfLines={2}
              marginBottom="$4"
            >
              {practice.title}
            </Text>

            {/* ── Single overview card (matches product structure) ── */}
            <View style={styles.card}>
              {/* Description */}
              <Text
                fontSize={16}
                fontWeight="500"
                color={colors.text.dark}
                marginBottom="$3"
                paddingRight={88}
              >
                {practice.description || t("mobile_default_description")}
              </Text>

              {/* Progress ring */}
              <View style={styles.progressRing}>
                <CircularProgress
                  value={progress}
                  size={60}
                  strokeWidth={4}
                  backgroundColor={colors.background.gray}
                />
              </View>

              {/* Frequency + Duration */}
              {hasStats && (
                <XStack
                  marginBottom="$3"
                  paddingBottom="$3"
                  borderBottomWidth={1}
                  borderBottomColor="#E4EAE9"
                >
                  {Boolean(frequencyLabel) && (
                    <YStack width={80}>
                      <Text fontSize={12} color={colors.text.dark}>
                        {t("mobile_frequency_week_label")}
                      </Text>
                      <XStack alignItems="baseline" gap={2}>
                        <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                          {frequencyLabel}
                        </Text>
                        <Text fontSize={12} color={colors.text.dark}>
                          {t("mobile_day_unit")}
                        </Text>
                      </XStack>
                    </YStack>
                  )}
                  {practice.sessionDurationMinutes != null && (
                    <YStack width={80}>
                      <Text fontSize={12} color={colors.text.dark}>
                        {t("mobile_once_label")}
                      </Text>
                      <XStack alignItems="baseline" gap={2}>
                        <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                          {practice.sessionDurationMinutes}
                        </Text>
                        <Text fontSize={12} color={colors.text.dark}>
                          {t("mobile_minute_unit")}
                        </Text>
                      </XStack>
                    </YStack>
                  )}
                </XStack>
              )}

              {/* Tags */}
              {practice.tags && practice.tags.length > 0 && (
                <XStack flexWrap="wrap" gap="$2" marginBottom="$3">
                  {practice.tags.map((tag) => (
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

              {/* ── "更多資訊" expandable (matches product) ── */}
              <Pressable onPress={() => setInfoExpanded((v) => !v)} style={styles.moreInfoButton}>
                <Text fontSize={14} color="#9FB5B8">
                  {detailT("more_info")}
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
                    <ExecutionTimingCard executionTiming={executionTiming} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ExecutionDurationCard
                      durationDays={durationDays}
                      startDate={practice.startDate ?? null}
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
              resourceCount={practice.resources?.length}
            />

            {/* ── Tab content ── */}
            {activeTab === "comments" && <CommentSection targetType="practice" targetId={id} />}

            {activeTab === "checkins" &&
              (checkInsError ? (
                <YStack alignItems="center" paddingVertical="$8">
                  <Text color="rgba(0,0,0,0.4)" fontSize={14}>
                    {detailT("checkins_load_failed")}
                  </Text>
                </YStack>
              ) : (
                <YStack paddingTop="$4" gap="$4">
                  {/* 心情排行 + 打卡堆疊，對齊 product 的打卡紀錄分頁 */}
                  <CheckInRecordCard checkInsData={checkInsData} isLoading={isLoadingCheckIns} />
                  <CheckInStack
                    checkInsData={checkInsData}
                    onCheckInPress={(checkInId) =>
                      router.push(`/practices/${id}/check-ins/${checkInId}` as never)
                    }
                  />
                </YStack>
              ))}

            {activeTab === "resources" &&
              (practice.resources && practice.resources.length > 0 ? (
                <YStack paddingTop="$4" gap="$3">
                  {practice.resources.map((resource) => (
                    <PracticeResourceListCard key={resource.id} resource={resource} />
                  ))}
                </YStack>
              ) : (
                <YStack paddingVertical="$4">
                  <Text color="#9FB5B8" fontSize={14}>
                    {detailT("empty_resources")}
                  </Text>
                </YStack>
              ))}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Action Button */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding="$4"
        backgroundColor={colors.background.veryLightGray}
        borderTopWidth={1}
        borderTopColor="#E4EAE9"
      >
        {renderFooterButton()}
      </YStack>

      {/* Check-in Sheet */}
      <CheckInSheet
        open={showCheckInSheet}
        onOpenChange={setShowCheckInSheet}
        practice={practice}
        onCheckIn={handleCheckIn}
        onShare={() => {
          setShowCheckInSheet(false);
          setTimeout(() => setShowShareSheet(true), 300);
        }}
      />

      {/* Share Sheet */}
      <ShareCheckInSheet
        open={showShareSheet}
        onOpenChange={setShowShareSheet}
        practice={practice}
        streakCount={practice.currentStreak + 1}
      />

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
