import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Tag,
  Trash2,
  X,
} from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mutate as globalMutate } from "swr";
import { Card, ScrollView, Spinner, Text, View, XStack, YStack } from "tamagui";
import { CheckInList, CheckInSheet, ProgressRing, ShareCheckInSheet } from "@/components";
import type { ICheckInData } from "@/components/CheckInSheet";
import { PublicPracticeView } from "@/components/practice/detail/PublicPracticeView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
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

// 執行時機標籤
const timingLabels: Record<string, string> = {
  holiday: "timing_holiday",
  commute: "timing_commute",
  beforeSleep: "timing_before_sleep",
  morning: "timing_morning",
  lunch: "timing_lunch",
  evening: "timing_evening",
};

export default function PracticeDetailScreen() {
  const { id, showcaseData } = useLocalSearchParams<{ id: string; showcaseData?: string }>();
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  // Status labels live under mobile.practiceCard, not the practice namespace.
  const statusT = useMobileTranslation("mobile.practiceCard");
  const { user: currentUser } = useAuth();
  const { practice, isLoading, mutate } = usePractice(id);
  const { checkIn, isChecking } = useCheckIn();
  const { checkIns } = useCheckIns(id);

  const [showCheckInSheet, setShowCheckInSheet] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

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

  const handleArchive = useCallback(() => {
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
    practice.targetDays > 0 ? Math.round((practice.completedDays / practice.targetDays) * 100) : 0;

  const status = practice.status || "in-progress";
  const statusInfo = statusConfig[status] || statusConfig["in-progress"];
  const canViewSummary = status === "completed" || practice.targetDays <= practice.completedDays;

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
            accessibilityLabel={commonT("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={16} fontWeight="500" color="$color">
            {t("create_title")}
          </Text>
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.push("/")}
            accessibilityLabel={commonT("close")}
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
              <Badge backgroundColor={statusInfo.backgroundColor} paddingHorizontal="$2">
                <Text fontSize={12} color={statusInfo.textColor} fontWeight="500">
                  {statusT(statusInfo.labelKey)}
                </Text>
              </Badge>
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
                  {practice.description || t("mobile_default_description")}
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
                      {t("mobile_frequency_week_label")}
                    </Text>
                    <XStack alignItems="baseline" gap={2}>
                      <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                        {frequency}
                      </Text>
                      <Text fontSize={12} color="$color">
                        {t("mobile_day_unit")}
                      </Text>
                    </XStack>
                  </YStack>
                  <YStack width={80}>
                    <Text fontSize={12} color="$color" opacity={0.6}>
                      {t("mobile_once_label")}
                    </Text>
                    <XStack alignItems="baseline" gap={2}>
                      <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                        {durationMinutes}
                      </Text>
                      <Text fontSize={12} color="$color">
                        {t("mobile_minute_unit")}
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
                {t("mobile_execution_timing_label")}
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
                      {timingLabels[timing] ? t(timingLabels[timing]) : timing}
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </Card>

            {/* Duration Card */}
            <Card flex={1} backgroundColor={colors.primary.palest} borderRadius={12} padding="$4">
              <Text fontSize={12} color={colors.primary.darker} marginBottom="$2">
                {t("mobile_remaining_days")}
              </Text>
              <XStack alignItems="baseline" gap={4}>
                <Text fontSize={24} fontWeight="600" color={colors.primary.darker}>
                  {practice.targetDays - practice.completedDays}
                </Text>
                <Text fontSize={12} color={colors.primary.darker}>
                  {t("mobile_remaining_total", { total: practice.targetDays })}
                </Text>
              </XStack>
            </Card>
          </XStack>

          {/* Check-in History */}
          <YStack gap="$3">
            <Text fontSize={16} fontWeight="600" color="$color">
              {t("mobile_checkin_history")}
            </Text>
            <CheckInList checkIns={checkIns || []} practiceId={id} />
          </YStack>

          {/* Action Buttons */}
          <YStack alignItems="center" gap="$3" marginTop="$4">
            {canViewSummary ? (
              <Button
                backgroundColor={colors.primary.base}
                borderRadius="$md"
                paddingHorizontal="$6"
                onPress={() => router.push(`/practices/${id}/summary` as never)}
              >
                <XStack alignItems="center" gap="$2">
                  <FileText size={18} color="white" />
                  <Text color="white" fontWeight="600">
                    {t("view_summary")}
                  </Text>
                </XStack>
              </Button>
            ) : null}

            <Button
              backgroundColor="white"
              borderRadius="$md"
              paddingHorizontal="$6"
              onPress={handleArchive}
            >
              <XStack alignItems="center" gap="$2">
                <Archive size={18} color="$color" />
                <Text color="$color">{t("mobile_archive_action")}</Text>
              </XStack>
            </Button>

            <Button
              backgroundColor="transparent"
              borderWidth={1}
              borderColor={colors.primary.base}
              borderRadius="$md"
              paddingHorizontal="$6"
              onPress={handleDelete}
            >
              <XStack alignItems="center" gap="$2">
                <Trash2 size={18} color="$color" />
                <Text color="$color">{t("mobile_delete_action")}</Text>
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
        {!practice.todayCheckedIn ? (
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
                  {t("mobile_checkin_action")}
                </Text>
              </XStack>
            )}
          </Button>
        ) : (
          <Button size="$5" backgroundColor={colors.semantic.success} borderRadius="$md" disabled>
            <XStack alignItems="center" gap="$2">
              <Check size={18} color="white" />
              <Text color="white" fontWeight="600" fontSize={16}>
                {t("mobile_today_completed")}
              </Text>
            </XStack>
          </Button>
        )}
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
    </SafeAreaView>
  );
}
