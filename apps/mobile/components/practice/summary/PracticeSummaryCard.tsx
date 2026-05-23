import type { MoodType, PracticeSummary } from "@daodao/api";
import { CalendarDays, Footprints, MessageCircle, Smile } from "@tamagui/lucide-icons";
import { Card, Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

interface PracticeSummaryCardProps {
  summary: PracticeSummary;
}

const moodLabels: Record<MoodType, { labelKey: string; emoji: string }> = {
  give_up: { labelKey: "mood_give_up", emoji: "😞" },
  frustrated: { labelKey: "mood_frustrated", emoji: "😣" },
  bored: { labelKey: "mood_bored", emoji: "😐" },
  neutral: { labelKey: "mood_neutral", emoji: "🙂" },
  good: { labelKey: "mood_good", emoji: "😊" },
  happy: { labelKey: "mood_happy", emoji: "😄" },
};

const formatDate = (date: string, fallback: string) => {
  if (!date) return fallback;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};

export function PracticeSummaryCard({ summary }: PracticeSummaryCardProps) {
  const t = useMobileTranslation("mobile.practiceSummaryCard");
  const themeColor = summary.themeColor || colors.primary.base;
  const topNotes = summary.topNotes.filter(Boolean);

  return (
    <Card
      backgroundColor="#F4F6F6"
      borderRadius={16}
      padding="$5"
      overflow="hidden"
      shadowColor="rgba(0,0,0,0.08)"
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={1}
      shadowRadius={12}
      gap="$5"
    >
      <View
        position="absolute"
        width={160}
        height={160}
        borderRadius={80}
        backgroundColor={`${themeColor}30`}
        top={-58}
        right={-44}
      />
      <View
        position="absolute"
        width={128}
        height={128}
        borderRadius={64}
        backgroundColor="#A8E0E050"
        bottom={-48}
        left={-40}
      />

      <YStack gap="$2">
        <Text fontSize={16} fontWeight="600" color={colors.primary.darker}>
          {summary.userName}
        </Text>
        <XStack alignItems="center" gap="$2">
          <CalendarDays size={15} color={colors.basic[500]} />
          <Text fontSize={13} color="$color" opacity={0.7}>
            {formatDate(summary.startDate, t("not_set"))} -{" "}
            {formatDate(summary.endDate, t("not_set"))}
          </Text>
        </XStack>
      </YStack>

      <YStack gap="$2">
        <Text fontSize={24} lineHeight={30} fontWeight="700" color="$color">
          {summary.practiceName}
        </Text>
        {summary.practiceDescription ? (
          <YStack backgroundColor="white" borderRadius="$md" padding="$3">
            <Text fontSize={14} lineHeight={21} color="$color" opacity={0.82}>
              {summary.practiceDescription}
            </Text>
          </YStack>
        ) : null}
      </YStack>

      <XStack gap="$3">
        <YStack
          flex={1}
          minHeight={104}
          backgroundColor="#FCDD84"
          borderRadius="$lg"
          padding="$4"
          justifyContent="center"
          gap="$1"
        >
          <XStack alignItems="center" gap="$2">
            <Footprints size={18} color={colors.text.dark} />
            <Text fontSize={13} color={colors.text.dark}>
              {t("footprints")}
            </Text>
          </XStack>
          <XStack alignItems="baseline" gap="$1">
            <Text fontSize={38} lineHeight={44} fontWeight="800" color={colors.text.dark}>
              {summary.checkInCount}
            </Text>
            <Text fontSize={14} color={colors.text.dark}>
              {t("times")}
            </Text>
          </XStack>
        </YStack>

        <YStack
          flex={1}
          minHeight={104}
          backgroundColor="white"
          borderRadius="$lg"
          padding="$4"
          gap="$2"
        >
          <XStack alignItems="center" gap="$2">
            <Smile size={18} color={colors.primary.darker} />
            <Text fontSize={13} color={colors.primary.darker}>
              {t("mood")}
            </Text>
          </XStack>
          <XStack flexWrap="wrap" gap="$2">
            {summary.topMoods.length > 0 ? (
              summary.topMoods.map((mood) => (
                <XStack
                  key={mood.mood}
                  alignItems="center"
                  gap="$1"
                  backgroundColor={colors.primary.palest}
                  borderRadius="$sm"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                >
                  <Text fontSize={16}>{moodLabels[mood.mood]?.emoji}</Text>
                  <Text fontSize={12} color={colors.primary.darker}>
                    {moodLabels[mood.mood]?.labelKey
                      ? t(moodLabels[mood.mood].labelKey)
                      : mood.mood}
                  </Text>
                </XStack>
              ))
            ) : (
              <Text fontSize={13} color="$color" opacity={0.55}>
                {t("empty_mood")}
              </Text>
            )}
          </XStack>
        </YStack>
      </XStack>

      <YStack gap="$3">
        <XStack alignItems="center" gap="$2">
          <MessageCircle size={18} color={colors.primary.darker} />
          <Text fontSize={16} fontWeight="600" color="$color">
            {t("journey_notes")}
          </Text>
        </XStack>
        {topNotes.length > 0 ? (
          topNotes.slice(0, 3).map((note, index) => (
            <YStack
              key={`${index}-${note}`}
              backgroundColor="white"
              borderRadius="$md"
              padding="$3"
            >
              <Text fontSize={14} lineHeight={21} color="$color">
                {note}
              </Text>
            </YStack>
          ))
        ) : (
          <YStack backgroundColor="white" borderRadius="$md" padding="$3">
            <Text fontSize={14} color="$color" opacity={0.55}>
              {t("empty_notes")}
            </Text>
          </YStack>
        )}
      </YStack>

      <YStack borderTopWidth={1} borderTopColor="rgba(0,0,0,0.06)" paddingTop="$4">
        <Text fontSize={12} color="$color" opacity={0.55}>
          {t("brand_footer")}
        </Text>
      </YStack>
    </Card>
  );
}
