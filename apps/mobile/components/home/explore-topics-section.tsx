import { FlatList } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { IExploreTopicRecommendation } from "@/hooks/useChallenges";
import { ExploreTopicCard } from "./explore-topic-card";

interface ExploreTopicsSectionProps {
  topics: IExploreTopicRecommendation[];
}

export function ExploreTopicsSection({ topics }: ExploreTopicsSectionProps) {
  if (topics.length === 0) return null;

  return (
    <YStack paddingTop="$6" gap="$4">
      {/* Section header */}
      <XStack paddingHorizontal="$4" alignItems="center" gap="$2">
        <Text fontSize={20} fontWeight="700" color={colors.text.dark}>
          ✦ 探索相關主題
        </Text>
        <Text fontSize={14} color="#9CA3AF">
          看看其他人都在實踐什麼
        </Text>
      </XStack>

      {/* Horizontal card list */}
      <FlatList
        horizontal
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExploreTopicCard topic={item} />}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 8 }}
        showsHorizontalScrollIndicator={false}
      />
    </YStack>
  );
}
