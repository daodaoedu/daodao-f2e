import { Check, MessageSquare } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileI18n, useMobileTranslation } from "@/i18n";
import type { ICheckIn } from "@/types/practice";

interface CheckInListProps {
  checkIns: ICheckIn[];
  emptyText?: string;
  practiceId?: string;
}

function formatDate(
  dateString: string,
  locale: string,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const date = new Date(dateString);
  const now = new Date();

  // 使用日期比較而非時間差，避免午夜邊界問題
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return t("today_time", {
      time: date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
    });
  } else if (diffDays === 1) {
    return t("yesterday_time", {
      time: date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
    });
  } else if (diffDays < 7) {
    return t("days_ago", { count: diffDays });
  } else {
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
  }
}

export function CheckInList({ checkIns, emptyText, practiceId }: CheckInListProps) {
  const router = useRouter();
  const { locale } = useMobileI18n();
  const t = useMobileTranslation("mobile.checkInList");
  const effectiveEmptyText = emptyText ?? t("empty");

  const handlePress = useCallback(
    (checkInId: string) => {
      if (!practiceId) return;
      router.push(`/practices/${practiceId}/check-ins/${checkInId}` as never);
    },
    [practiceId, router]
  );

  if (checkIns.length === 0) {
    return (
      <YStack padding="$6" alignItems="center" justifyContent="center" gap="$2">
        <Check size={32} color={colors.basic[300]} />
        <Text fontSize={14} color="$color" opacity={0.5}>
          {effectiveEmptyText}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      {checkIns.map((checkIn, index) => (
        <Pressable key={checkIn.id} disabled={!practiceId} onPress={() => handlePress(checkIn.id)}>
          <Card
            padding="$4"
            backgroundColor="$background"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            pressStyle={practiceId ? { opacity: 0.82 } : undefined}
          >
            <XStack gap="$3" alignItems="flex-start">
              {/* Check Icon */}
              <YStack
                width={32}
                height={32}
                backgroundColor={`${colors.semantic.success}20`}
                borderRadius={16}
                alignItems="center"
                justifyContent="center"
              >
                <Check size={16} color={colors.semantic.success} />
              </YStack>

              {/* Content */}
              <YStack flex={1} gap="$1">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={14} fontWeight="600" color="$color">
                    第 {checkIns.length - index} 次打卡
                  </Text>
                  <Text fontSize={12} color="$color" opacity={0.5}>
                    {formatDate(checkIn.createdAt, locale, t)}
                  </Text>
                </XStack>

                {checkIn.note && (
                  <XStack gap="$2" marginTop="$1">
                    <MessageSquare size={14} color="$color" opacity={0.5} />
                    <Text fontSize={13} color="$color" opacity={0.7} flex={1}>
                      {checkIn.note}
                    </Text>
                  </XStack>
                )}
              </YStack>
            </XStack>
          </Card>
        </Pressable>
      ))}
    </YStack>
  );
}
