import { Archive, Check, ChevronLeft, ChevronRight, Tag, Trash2, X } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Spinner, Text, View, XStack, YStack } from "tamagui";
import { CheckInList, CheckInSheet, ProgressRing, ShareCheckInSheet } from "@/components";
import type { CheckInData } from "@/components/CheckInSheet";
import { colors } from "@/generated/design-tokens";
import { useArchivePractice, useDeletePractice } from "@daodao/api";
import { useCheckIn, useCheckIns, usePractice } from "@/hooks/usePractices";
import { computeStreaks, isTodayCheckedIn } from "@/hooks/use-practice-groups";
import type { CheckIn, CombinedStatus, Practice } from "@/types/practice";

// 狀態標籤配置
const statusConfig: Record<string, { label: string; backgroundColor: string; textColor: string }> =
  {
    draft: { label: "草稿", backgroundColor: "rgba(255, 255, 255, 0.8)", textColor: "#666666" },
    "not_started": { label: "未開始", backgroundColor: "#E0F4FF", textColor: "#0088CC" },
    "in-progress": { label: "進行中", backgroundColor: "#16B9B3", textColor: "#FFFFFF" },
    active: { label: "進行中", backgroundColor: "#16B9B3", textColor: "#FFFFFF" },
    completed: { label: "已完成", backgroundColor: "#10B981", textColor: "#FFFFFF" },
  };

// 執行時機標籤
const timingLabels: Record<string, string> = {
  holiday: "休假日",
  commute: "通勤中",
  beforeSleep: "睡前",
  morning: "早晨",
  lunch: "午休",
  evening: "傍晚",
};

export default function PracticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { practice, isLoading, mutate } = usePractice(id);
  const { checkIn, isChecking } = useCheckIn();
  const { checkIns, checkInDates } = useCheckIns(id);
  const { archivePractice } = useArchivePractice(id ?? "");
  const { deletePractice } = useDeletePractice(id ?? "");

  const [showCheckInSheet, setShowCheckInSheet] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCheckIn = useCallback(
    async (data: CheckInData) => {
      if (!id) return { success: false, error: "無效的實踐 ID" };

      const result = await checkIn({ practiceId: id, note: data.description });

      if (result.success) {
        await mutate();
      } else if (result.error) {
        Alert.alert("打卡失敗", result.error);
      }

      return result;
    },
    [id, checkIn, mutate]
  );

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const handleArchive = useCallback(() => {
    Alert.alert("封存實踐", "確定要封存此實踐嗎？", [
      { text: "取消", style: "cancel" },
      {
        text: "封存",
        onPress: async () => {
          setIsArchiving(true);
          try {
            await archivePractice();
            router.back();
          } catch (e) {
            Alert.alert("封存失敗", e instanceof Error ? e.message : "請稍後再試");
          } finally {
            setIsArchiving(false);
          }
        },
      },
    ]);
  }, [archivePractice, router]);

  const handleDelete = useCallback(() => {
    Alert.alert("刪除實踐", "確定要刪除此實踐嗎？此操作無法復原。", [
      { text: "取消", style: "cancel" },
      {
        text: "刪除",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deletePractice();
            router.replace("/");
          } catch (e) {
            Alert.alert("刪除失敗", e instanceof Error ? e.message : "請稍後再試");
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }, [deletePractice, router]);

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
            找不到此實踐
          </Text>
          <Button onPress={() => router.back()}>
            <Text>返回</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const progress = practice.progressPercentage ?? 0;

  // 建立符合本地 Practice 型別的物件供舊版組件（CheckInSheet/ShareCheckInSheet）使用
  const { currentStreak, longestStreak } = computeStreaks(checkInDates);
  const practiceForUI: Practice = {
    id: practice.id,
    title: practice.title,
    description: practice.practiceAction,
    frequency: "daily",
    targetDays: practice.durationDays ?? 0,
    completedDays: practice.checkInCount,
    currentStreak,
    longestStreak,
    status: (practice.status === "not_started" ? "not-started" : practice.status) as CombinedStatus,
    tags: practice.tags,
    color: practice.themeColor,
    todayCheckedIn: isTodayCheckedIn(practice.lastCheckinAt),
    isCompleted: practice.status === "completed",
    createdAt: practice.createdAt,
    updatedAt: practice.updatedAt ?? practice.createdAt,
  };

  // CheckInEntity.id 是 number；本地 CheckIn.id 是 string
  const checkInsForList: CheckIn[] = checkIns.map((ci) => ({
    id: String(ci.id),
    practiceId: String(ci.practiceId ?? ""),
    note: ci.note,
    createdAt: ci.createdAt,
  }));

  const status = practice.status || "in-progress";
  const statusInfo = statusConfig[status] || statusConfig["in-progress"];

  // 模擬執行時機數據
  const executionTiming = ["holiday", "commute", "beforeSleep"];
  const frequency = "2-4";
  const durationMinutes = 40;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        flex={1}
        backgroundColor="$background"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={colors.primary.base}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <XStack padding="$4" justifyContent="space-between" alignItems="center">
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.back()}
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={16} fontWeight="500" color="$color">
            主題實踐
          </Text>
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.push("/")}
            accessibilityLabel="關閉"
          >
            <X size={20} color="$color" />
          </Button>
        </XStack>

        <YStack paddingHorizontal="$5" gap="$4">
          {/* Title Section with Navigation */}
          <XStack alignItems="center" gap="$2" height={84}>
            <Button size="$4" circular backgroundColor="white" opacity={0.5} disabled>
              <ChevronLeft size={24} color="$color" />
            </Button>

            <YStack flex={1} alignItems="center" gap="$2">
              <XStack
                backgroundColor={statusInfo.backgroundColor}
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$sm"
              >
                <Text fontSize={12} color={statusInfo.textColor} fontWeight="500">
                  {statusInfo.label}
                </Text>
              </XStack>
              <Text
                fontSize={18}
                fontWeight="600"
                color="$color"
                textAlign="center"
                numberOfLines={2}
              >
                {practice.title}
              </Text>
            </YStack>

            <Button size="$4" circular backgroundColor="white" opacity={0.5} disabled>
              <ChevronRight size={24} color="$color" />
            </Button>
          </XStack>

          {/* Practice Overview Card */}
          <Card
            backgroundColor="white"
            borderRadius={12}
            padding="$4"
            shadowColor="rgba(0,0,0,0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={1}
            shadowRadius={8}
          >
            <XStack>
              <YStack flex={1} paddingRight="$4">
                {/* Description */}
                <Text fontSize={15} fontWeight="500" color="$color" marginBottom="$3">
                  {practice.practiceAction || "每天學習，持續進步"}
                </Text>

                {/* Frequency */}
                <XStack
                  marginBottom="$3"
                  paddingBottom="$3"
                  borderBottomWidth={1}
                  borderBottomColor={colors.basic[200]}
                >
                  <YStack width={80}>
                    <Text fontSize={12} color="$color" opacity={0.6}>
                      一週
                    </Text>
                    <XStack alignItems="baseline" gap={2}>
                      <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                        {frequency}
                      </Text>
                      <Text fontSize={12} color="$color">
                        天
                      </Text>
                    </XStack>
                  </YStack>
                  <YStack width={80}>
                    <Text fontSize={12} color="$color" opacity={0.6}>
                      一次
                    </Text>
                    <XStack alignItems="baseline" gap={2}>
                      <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                        {durationMinutes}
                      </Text>
                      <Text fontSize={12} color="$color">
                        分鐘
                      </Text>
                    </XStack>
                  </YStack>
                </XStack>

                {/* Tags */}
                {practice.tags && practice.tags.length > 0 && (
                  <XStack flexWrap="wrap" gap="$2">
                    {practice.tags.map((tag) => (
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
                        <Text fontSize={12} color="$color">
                          {tag}
                        </Text>
                      </XStack>
                    ))}
                  </XStack>
                )}
              </YStack>

              {/* Progress Ring */}
              <View position="absolute" right={16} top={16}>
                <ProgressRing
                  progress={progress}
                  size={72}
                  strokeWidth={6}
                  color={colors.primary.base}
                />
              </View>
            </XStack>
          </Card>

          {/* Execution Timing & Duration */}
          <XStack gap="$3">
            {/* Execution Timing Card */}
            <Card flex={1} backgroundColor={colors.primary.palest} borderRadius={12} padding="$4">
              <Text fontSize={12} color={colors.primary.darker} marginBottom="$2">
                執行時機
              </Text>
              <XStack flexWrap="wrap" gap="$1">
                {executionTiming.map((timing) => (
                  <XStack
                    key={timing}
                    backgroundColor="white"
                    paddingHorizontal="$2"
                    paddingVertical={4}
                    borderRadius="$sm"
                  >
                    <Text fontSize={12} color={colors.primary.base}>
                      {timingLabels[timing] || timing}
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </Card>

            {/* Duration Card */}
            <Card flex={1} backgroundColor={colors.primary.palest} borderRadius={12} padding="$4">
              <Text fontSize={12} color={colors.primary.darker} marginBottom="$2">
                剩餘天數
              </Text>
              <XStack alignItems="baseline" gap={4}>
                <Text fontSize={24} fontWeight="600" color={colors.primary.darker}>
                  {(practice.durationDays ?? 0) - practice.checkInCount}
                </Text>
                <Text fontSize={12} color={colors.primary.darker}>
                  / {practice.durationDays ?? 0} 天
                </Text>
              </XStack>
            </Card>
          </XStack>

          {/* Check-in History */}
          <YStack gap="$3">
            <Text fontSize={16} fontWeight="600" color="$color">
              打卡紀錄
            </Text>
            <CheckInList checkIns={checkInsForList} />
          </YStack>

          {/* Action Buttons */}
          <YStack alignItems="center" gap="$3" marginTop="$4">
            <Button
              backgroundColor="white"
              borderRadius="$md"
              paddingHorizontal="$6"
              onPress={handleArchive}
              disabled={isArchiving || isDeleting}
              opacity={isArchiving || isDeleting ? 0.6 : 1}
            >
              <XStack alignItems="center" gap="$2">
                <Archive size={18} color="$color" />
                <Text color="$color">封存實踐</Text>
              </XStack>
            </Button>

            <Button
              backgroundColor="transparent"
              borderWidth={1}
              borderColor={colors.primary.base}
              borderRadius="$md"
              paddingHorizontal="$6"
              onPress={handleDelete}
              disabled={isArchiving || isDeleting}
              opacity={isArchiving || isDeleting ? 0.6 : 1}
            >
              <XStack alignItems="center" gap="$2">
                <Trash2 size={18} color="$color" />
                <Text color="$color">刪除實踐</Text>
              </XStack>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Fixed Bottom Check-in Button */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding="$4"
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        {!isTodayCheckedIn(practice.lastCheckinAt) ? (
          <Button
            size="$5"
            backgroundColor="#FF8C42"
            borderRadius="$md"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => setShowCheckInSheet(true)}
            disabled={isChecking}
          >
            {isChecking ? (
              <Spinner color="white" />
            ) : (
              <XStack alignItems="center" gap="$2">
                <Check size={18} color="white" />
                <Text color="white" fontWeight="600" fontSize={16}>
                  打卡
                </Text>
              </XStack>
            )}
          </Button>
        ) : (
          <Button size="$5" backgroundColor={colors.semantic.success} borderRadius="$md" disabled>
            <XStack alignItems="center" gap="$2">
              <Check size={18} color="white" />
              <Text color="white" fontWeight="600" fontSize={16}>
                今日已完成
              </Text>
            </XStack>
          </Button>
        )}
      </YStack>

      {/* Check-in Sheet */}
      <CheckInSheet
        open={showCheckInSheet}
        onOpenChange={setShowCheckInSheet}
        practice={practiceForUI}
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
        practice={practiceForUI}
        streakCount={practiceForUI.currentStreak + 1}
      />
    </SafeAreaView>
  );
}
