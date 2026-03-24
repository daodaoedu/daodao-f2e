import { Check, MessageSquare } from "@tamagui/lucide-icons";
import { Card, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { ICheckIn } from "@/types/practice";

interface CheckInListProps {
  checkIns: ICheckIn[];
  emptyText?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  // 使用日期比較而非時間差，避免午夜邊界問題
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `今天 ${date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays === 1) {
    return `昨天 ${date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" });
  }
}

export function CheckInList({ checkIns, emptyText = "還沒有打卡紀錄" }: CheckInListProps) {
  if (checkIns.length === 0) {
    return (
      <YStack padding="$6" alignItems="center" justifyContent="center" gap="$2">
        <Check size={32} color={colors.basic[300]} />
        <Text fontSize={14} color="$color" opacity={0.5}>
          {emptyText}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      {checkIns.map((checkIn, index) => (
        <Card
          key={checkIn.id}
          padding="$4"
          backgroundColor="$background"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
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
                  {formatDate(checkIn.createdAt)}
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
      ))}
    </YStack>
  );
}
