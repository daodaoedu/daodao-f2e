/**
 * RecommendationSection — 對齊 product dashboard/recommendation-section。
 * 「探索相關主題」：AI 生成的主題實踐推薦，橫向卡片含作者與讚/踩回饋。
 */
import { ThumbsDown, ThumbsUp } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { Avatar, Card, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import {
  type FeedbackType,
  type ITopicCard,
  submitTopicFeedback,
  useTopicCards,
} from "@/hooks/useTopicCards";
import { useMobileTranslation } from "@/i18n";

const CARD_WIDTH = 280;

export function RecommendationSection() {
  const router = useRouter();
  const t = useMobileTranslation("dashboard");
  const { data, isLoading } = useTopicCards(true, 3);
  const [cards, setCards] = useState<ITopicCard[]>([]);

  useEffect(() => {
    if (data) setCards(data);
  }, [data]);

  const handleFeedback = async (card: ITopicCard, type: FeedbackType) => {
    const nextState =
      type === "like"
        ? card.feedbackState === "liked"
          ? "neutral"
          : "liked"
        : card.feedbackState === "disliked"
          ? "neutral"
          : "disliked";
    // 樂觀更新
    setCards((prev) =>
      prev.map((c) => (c.practiceId === card.practiceId ? { ...c, feedbackState: nextState } : c))
    );
    try {
      await submitTopicFeedback(card.practiceId, type);
    } catch (error) {
      // 已用樂觀更新 + 回滾處理 UX，這裡僅記錄供除錯；用 console.log 而非
      // console.error 避免 dev LogBox 在網路暫時失敗時誤報。
      console.log("Failed to submit topic feedback:", error);
      // 回滾
      setCards((prev) =>
        prev.map((c) =>
          c.practiceId === card.practiceId ? { ...c, feedbackState: card.feedbackState } : c
        )
      );
    }
  };

  if (isLoading) {
    return (
      <YStack paddingHorizontal="$4" paddingVertical="$6" alignItems="center">
        <Spinner color={colors.primary.base} />
      </YStack>
    );
  }

  if (cards.length === 0) return null;

  return (
    <YStack marginTop="$4" gap="$3">
      <YStack paddingHorizontal="$4">
        <Text fontSize={18} fontWeight="600" color={colors.text.dark}>
          {t("section_title")}
        </Text>
        <Text fontSize={13} color={colors.text.muted}>
          {t("section_subtitle")}
        </Text>
      </YStack>

      <FlatList
        horizontal
        data={cards}
        keyExtractor={(item) => item.practiceId}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <Card
            width={CARD_WIDTH}
            padding="$4"
            backgroundColor={colors.background.light}
            borderRadius={16}
            borderWidth={1}
            borderColor={colors.border.light}
            pressStyle={{ opacity: 0.9 }}
            onPress={() => router.push(`/practices/${item.practiceId}` as never)}
          >
            <YStack gap="$2">
              <Text fontSize={16} fontWeight="700" color={colors.text.dark} numberOfLines={2}>
                {item.title}
              </Text>
              {item.description ? (
                <Text fontSize={13} color={colors.text.muted} numberOfLines={3}>
                  {item.description}
                </Text>
              ) : null}
              {item.tags.length > 0 ? (
                <XStack gap="$2" flexWrap="wrap">
                  {item.tags.slice(0, 3).map((tag) => (
                    <YStack
                      key={tag}
                      backgroundColor={colors.background.veryLightGray}
                      borderRadius="$full"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                    >
                      <Text fontSize={11} color={colors.text.muted}>
                        {tag}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
              ) : null}

              {/* Footer: 作者 + 讚/踩 */}
              <XStack alignItems="center" justifyContent="space-between" marginTop="$2">
                <XStack alignItems="center" gap="$2" flex={1}>
                  <Avatar circular size={24}>
                    {item.creator.photo_url ? (
                      <Avatar.Image source={{ uri: item.creator.photo_url }} />
                    ) : (
                      <Avatar.Fallback
                        backgroundColor={colors.primary.base}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize={11} color={colors.basic.white}>
                          {item.creator.name.charAt(0)}
                        </Text>
                      </Avatar.Fallback>
                    )}
                  </Avatar>
                  <Text fontSize={13} color={colors.text.dark} numberOfLines={1} flex={1}>
                    {item.creator.name}
                  </Text>
                </XStack>
                <XStack gap="$3" alignItems="center">
                  <Pressable
                    onPress={() => handleFeedback(item, "like")}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t("feedback_like")}
                  >
                    <ThumbsUp
                      size={18}
                      color={item.feedbackState === "liked" ? colors.logo.cyan : colors.text.muted}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => handleFeedback(item, "dislike")}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t("feedback_dislike")}
                  >
                    <ThumbsDown
                      size={18}
                      color={
                        item.feedbackState === "disliked" ? colors.text.dark : colors.text.muted
                      }
                    />
                  </Pressable>
                </XStack>
              </XStack>
            </YStack>
          </Card>
        )}
      />

      <Text fontSize={12} color={colors.text.muted} paddingHorizontal="$4">
        {t("ai_disclaimer")}
      </Text>
    </YStack>
  );
}
