import { usePracticeById, usePracticeSummary } from "@daodao/api";
import { ChevronLeft, Download, Home, Share2 } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { type RefObject, useMemo, useRef, useState } from "react";
import { Alert, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { PracticeSummaryCard } from "@/components/practice/summary";
import { colors } from "@/generated/design-tokens";
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
      title: `${summary.userName} 完成了主題實踐`,
      message: `我完成了「${summary.practiceName}」的實踐旅程！\n留下了 ${summary.checkInCount} 個成長足跡\n#島島阿學 #主題實踐`,
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
      Alert.alert("分享失敗", "請稍後再試一次");
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
        Alert.alert("儲存失敗", "無法擷取總結圖片，請稍後再試一次");
        return;
      }

      const result = await shareService.saveToGallery(imageUri);
      if (!result.success) {
        Alert.alert("儲存失敗", result.error ?? "無法儲存圖片到相簿");
        return;
      }

      Alert.alert("儲存成功", "總結圖片已儲存到相簿");
    } catch {
      Alert.alert("儲存失敗", "無法儲存圖片到相簿");
    } finally {
      setIsSaving(false);
    }
  };

  const renderHeader = () => (
    <XStack padding="$4" alignItems="center" gap="$3">
      <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel="返回">
        <ChevronLeft size={24} color="$color" />
      </Button>
      <YStack flex={1}>
        <Text fontSize={18} fontWeight="600" color="$color">
          實踐總結
        </Text>
        <Text fontSize={13} color="$color" opacity={0.6} numberOfLines={1}>
          {practice?.title ?? summary?.practiceName ?? "主題實踐"}
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
              正在生成總結...
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
              目前無法查看實踐總結
            </Text>
            <Text fontSize={14} color="$color" opacity={0.65} textAlign="center" lineHeight={21}>
              實踐完成或到期後，擁有者即可查看這趟旅程的總結。
            </Text>
            <Button
              backgroundColor={colors.primary.base}
              borderRadius="$md"
              onPress={() => router.back()}
            >
              <Text color="white" fontWeight="600">
                返回實踐
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
              載入失敗
            </Text>
            <Text fontSize={14} color="$color" opacity={0.65} textAlign="center" lineHeight={21}>
              {summaryError || "無法載入總結資料，請稍後再試。"}
            </Text>
            <Button
              backgroundColor={colors.primary.base}
              borderRadius="$md"
              onPress={() => refetch()}
            >
              <Text color="white" fontWeight="600">
                重新整理
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
                實踐完成
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
                    {isSharing ? "準備分享..." : "分享總結"}
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
                    {isSaving ? "儲存中..." : "保存到相簿"}
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
                    回到主頁
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
