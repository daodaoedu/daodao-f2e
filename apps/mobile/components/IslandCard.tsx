import { Lock } from "@tamagui/lucide-icons";
import { Card, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { Island } from "@/types/user";

// 安全地為 hex 顏色添加透明度
function withOpacity(color: string, opacity: number): string {
  // 確保是有效的 hex 顏色格式
  if (!color || !color.startsWith("#") || (color.length !== 7 && color.length !== 4)) {
    return (
      colors.primary.base +
      Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")
    );
  }
  // 轉換 3 位 hex 為 6 位
  const hex =
    color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color;
  return (
    hex +
    Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")
  );
}

interface IslandCardProps {
  island: Island;
  onPress?: () => void;
}

export function IslandCard({ island, onPress }: IslandCardProps) {
  const isLocked = !island.unlocked;
  const cardColor = island.color || colors.primary.base;

  return (
    <Card
      padding="$4"
      backgroundColor={isLocked ? colors.basic[100] : withOpacity(cardColor, 0.08)}
      borderRadius="$md"
      borderWidth={1}
      borderColor={isLocked ? colors.basic[200] : withOpacity(cardColor, 0.2)}
      opacity={isLocked ? 0.7 : 1}
      pressStyle={onPress ? { scale: 0.98 } : undefined}
      onPress={onPress}
      accessible
      accessibilityLabel={`${island.name} 島嶼${isLocked ? "（未解鎖）" : ""}`}
    >
      <XStack gap="$3" alignItems="center">
        {/* Island Icon */}
        <YStack
          width={48}
          height={48}
          backgroundColor={isLocked ? colors.basic[200] : withOpacity(cardColor, 0.15)}
          borderRadius={24}
          alignItems="center"
          justifyContent="center"
        >
          {isLocked ? (
            <Lock size={20} color={colors.basic[400]} />
          ) : (
            <Text fontSize={24}>{island.icon}</Text>
          )}
        </YStack>

        {/* Island Info */}
        <YStack flex={1} gap="$1">
          <Text fontSize={15} fontWeight="600" color={isLocked ? colors.basic[400] : "$color"}>
            {island.name}
          </Text>
          <Text
            fontSize={12}
            color={isLocked ? colors.basic[300] : "$color"}
            opacity={isLocked ? 1 : 0.6}
            numberOfLines={1}
          >
            {isLocked ? "完成更多實踐解鎖" : island.description}
          </Text>
        </YStack>

        {/* Progress */}
        {!isLocked && (
          <YStack alignItems="flex-end" gap="$1">
            <Text fontSize={14} fontWeight="600" color={cardColor}>
              {island.progress}%
            </Text>
            <YStack
              width={40}
              height={4}
              backgroundColor={colors.basic[200]}
              borderRadius={2}
              overflow="hidden"
            >
              <YStack
                height="100%"
                width={`${island.progress}%`}
                backgroundColor={cardColor}
                borderRadius={2}
              />
            </YStack>
          </YStack>
        )}
      </XStack>
    </Card>
  );
}

interface IslandListProps {
  islands: Island[];
  onIslandPress?: (island: Island) => void;
}

export function IslandList({ islands, onIslandPress }: IslandListProps) {
  if (islands.length === 0) {
    return (
      <YStack padding="$6" alignItems="center" justifyContent="center" gap="$2">
        <Text fontSize={32}>🏝️</Text>
        <Text fontSize={14} color="$color" opacity={0.5}>
          開始你的學習之旅，探索島嶼
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      {islands.map((island) => (
        <IslandCard
          key={island.id}
          island={island}
          onPress={onIslandPress ? () => onIslandPress(island) : undefined}
        />
      ))}
    </YStack>
  );
}
