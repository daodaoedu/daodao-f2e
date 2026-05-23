import { usePracticeById, usePracticeSummary } from "@daodao/api";
import { ChevronLeft, Download, Home, Share2 } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { type RefObject, useMemo, useRef, useState } from "react";
import { Alert, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { PracticeSummaryCard } from "@/components/practice/summary";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useAuth } from "@/providers/AuthProvider";
import { shareService } from "@/services/share";

const isCompletedOrExpired = (practice?: { status?: string; endDate?: string | null }) => {
  if (!practice) return false;
  if (practice.status === "completed") return true;
  if (!practice.endDate) return false;

  const endDate = new Date(practice.endDate);
  if (Number.isNaN(endDate.getTime())) return false;

  endDate.setHours(23, 59, 59, 999);
  return Date.now() > endDate.getTime();
};

export default function PracticeSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useMobileTranslation("mobile.practiceSummary");
  const tCommon = useMobileTranslation("common");
  const { user } = useAuth();
  const summaryCardRef = useRef<View | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const practiceId = typeof id === "string" ? id : "";

  const { data: practiceData, isLoading: isPracticeLoading } = usePracticeById(practiceId);
  const {
    summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch,
  } = usePracticeSummary(practiceId, { enabled: !!practiceId });

  const practice = practiceData?.data;
  const isOwner = !practice?.user?.id || !user?.id || practice.user.id === user.id;
  const canViewSummary = useMemo(() => isCompletedOrExpired(practice), [practice]);
  const isLoading = isPracticeLoading || isSummaryLoading;

  const getShareText = () => {
    if (!summary) return;

    return {
      title: t("share_title_completed", { name: summary.userName }),
      message: t("share_completed_message", {
        title: summary.practiceName,
        count: summary.checkInCount,
      }),
    };
  };

  const shareTextFallback = async () => {
    const shareText = getShareText();
    if (!shareText) return;

    await Share.share(shareText);
  };

  const captureSummaryCard = async () => {
    const result = await shareService.captureView(summaryCardRef as RefObject<View>, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    return result.success ? result.uri : undefined;
  };

  const handleShare = async () => {
    const shareText = getShareText();
    if (!summary || !shareText || isSharing || isSaving) return;

    setIsSharing(true);
    try {
      const imageUri = await captureSummaryCard();

      if (!imageUri) {
        await shareTextFallback();
        return;
      }

      const result = await shareService.share({
        ...shareText,
        imageUri,
      });

      if (!result.success) {
        await shareTextFallback();
      }
    } catch {
      Alert.alert(t("share_failed_title"), t("retry_later"));
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveImage = async () => {
    if (!summary || isSharing || isSaving) return;

    setIsSaving(true);
    try {
      const imageUri = await captureSummaryCard();
      if (!imageUri) {
        Alert.alert(t("save_failed_title"), t("capture_failed"));
        return;
      }

      const result = await shareService.saveToGallery(imageUri);
      if (!result.success) {
        Alert.alert(t("save_failed_title"), result.error ?? t("save_failed_message"));
        return;
      }

      Alert.alert(t("save_success_title"), t("save_success_message"));
    } catch {
      Alert.alert(t("save_failed_title"), t("save_failed_message"));
    } finally {
      setIsSaving(false);
    }
  };

  const renderHeader = () => (
    <XStack padding="$4" alignItems="center" gap="$3">
      <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel={tCommon("back")}>
        <ChevronLeft size={24} color="$color" />
      </Button>
      <YStack flex={1}>
        <Text fontSize={18} fontWeight="600" color="$color">
          {t("title")}
        </Text>
        <Text fontSize={13} color="$color" opacity={0.6} numberOfLines={1}>
          {practice?.title ?? summary?.practiceName ?? t("fallback_practice_title")}
        </Text>
      </YStack>
    </XStack>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          {renderHeader()}
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
            <Spinner size="large" color={colors.primary.base} />
            <Text fontSize={14} color="$color" opacity={0.65}>
              {t("loading_summary")}
            </Text>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  if (!practiceId || !practice || !isOwner || !canViewSummary) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          {renderHeader()}
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6">
            <Text fontSize={16} fontWeight="600" color="$color" textAlign="center">
              {t("unavailable_title")}
            </Text>
            <Text fontSize={14} color="$color" opacity={0.65} textAlign="center" lineHeight={21}>
              {t("unavailable_description")}
            </Text>
            <Button
              backgroundColor={colors.primary.base}
              borderRadius="$md"
              onPress={() => router.back()}
            >
              <Text color="white" fontWeight="600">
                {t("back_to_practice")}
              </Text>
            </Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  if (summaryError || !summary) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          {renderHeader()}
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6">
            <Text fontSize={16} fontWeight="600" color="$color" textAlign="center">
              {t("load_failed_title")}
            </Text>
            <Text fontSize={14} color="$color" opacity={0.65} textAlign="center" lineHeight={21}>
              {summaryError || t("load_failed_description")}
            </Text>
            <Button
              backgroundColor={colors.primary.base}
              borderRadius="$md"
              onPress={() => refetch()}
            >
              <Text color="white" fontWeight="600">
                {t("refresh")}
              </Text>
            </Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {renderHeader()}
        <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 32 }}>
          <YStack paddingHorizontal="$5" gap="$5">
            <YStack alignItems="center" gap="$2" paddingVertical="$2">
              <Text
                fontSize={24}
                lineHeight={30}
                fontWeight="700"
                color="$color"
                textAlign="center"
              >
                {t("completed_title")}
              </Text>
              <Text fontSize={14} color="$color" opacity={0.72} textAlign="center" lineHeight={22}>
                {summary.encouragementText}
              </Text>
            </YStack>

            <View ref={summaryCardRef} collapsable={false}>
              <PracticeSummaryCard summary={summary} />
            </View>

            <YStack gap="$3">
              <Button
                size="$5"
                backgroundColor="#FF8C42"
                borderRadius="$md"
                pressStyle={{ opacity: 0.86 }}
                onPress={handleShare}
                disabled={isSharing || isSaving}
                opacity={isSharing || isSaving ? 0.65 : 1}
              >
                <XStack alignItems="center" gap="$2">
                  {isSharing ? (
                    <Spinner size="small" color="white" />
                  ) : (
                    <Share2 size={18} color="white" />
                  )}
                  <Text color="white" fontWeight="600" fontSize={16}>
                    {isSharing ? t("preparing_share") : t("share_summary")}
                  </Text>
                </XStack>
              </Button>

              <Button
                size="$5"
                backgroundColor="white"
                borderColor="rgba(0,0,0,0.12)"
                borderWidth={1}
                borderRadius="$md"
                pressStyle={{ opacity: 0.86 }}
                onPress={handleSaveImage}
                disabled={isSharing || isSaving}
                opacity={isSharing || isSaving ? 0.65 : 1}
              >
                <XStack alignItems="center" gap="$2">
                  {isSaving ? (
                    <Spinner size="small" color={colors.primary.base} />
                  ) : (
                    <Download size={18} color={colors.primary.darker} />
                  )}
                  <Text color={colors.primary.darker} fontWeight="600" fontSize={16}>
                    {isSaving ? t("saving") : t("save_to_gallery")}
                  </Text>
                </XStack>
              </Button>

              <Button
                size="$5"
                backgroundColor="transparent"
                borderRadius="$md"
                onPress={() => router.push("/")}
                disabled={isSharing || isSaving}
                opacity={isSharing || isSaving ? 0.65 : 1}
              >
                <XStack alignItems="center" gap="$2">
                  <Home size={18} color="$color" />
                  <Text color="$color" fontWeight="500">
                    {t("back_home")}
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
