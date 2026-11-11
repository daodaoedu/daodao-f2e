import { ThumbsDown, ThumbsUp } from "@tamagui/lucide-icons";
import { Pressable, View as RNView, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { IExploreTopicRecommendation } from "@/hooks/useChallenges";

interface ExploreTopicCardProps {
  topic: IExploreTopicRecommendation;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
}

export function ExploreTopicCard({ topic, onLike, onDislike }: ExploreTopicCardProps) {
  const { id, title, description, tags, reason, authorName, authorAvatarChar, authorAvatarColor } =
    topic;

  return (
    <RNView style={styles.card}>
      <YStack gap="$3" flex={1}>
        {/* AI Reason tag */}
        <View style={styles.reasonTag}>
          <Text fontSize={12} color={colors.primary.base}>
            ✦ {reason}
          </Text>
        </View>

        {/* Title */}
        <Text fontSize={17} fontWeight="700" color={colors.text.dark}>
          {title}
        </Text>

        {/* Description */}
        <Text fontSize={13} color="#6B7280" lineHeight={20} numberOfLines={3}>
          {description}
        </Text>

        {/* Tags */}
        <XStack flexWrap="wrap" gap="$2">
          {tags.map((tag) => (
            <View key={tag} style={styles.tagBadge}>
              <Text fontSize={12} color="#6B7280">
                #{tag}
              </Text>
            </View>
          ))}
        </XStack>
      </YStack>

      {/* Footer: author + feedback */}
      <XStack justifyContent="space-between" alignItems="center" marginTop="$3">
        <XStack alignItems="center" gap="$2">
          <RNView style={[styles.authorAvatar, { backgroundColor: authorAvatarColor }]}>
            <Text fontSize={13} fontWeight="700" color="white">
              {authorAvatarChar}
            </Text>
          </RNView>
          <Text fontSize={13} color={colors.text.dark}>
            {authorName}
          </Text>
        </XStack>
        <XStack gap="$3" alignItems="center">
          <Pressable onPress={() => onLike?.(id)} hitSlop={8}>
            <ThumbsUp size={18} color="#9CA3AF" />
          </Pressable>
          <Pressable onPress={() => onDislike?.(id)} hitSlop={8}>
            <ThumbsDown size={18} color="#9CA3AF" />
          </Pressable>
        </XStack>
      </XStack>
    </RNView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    justifyContent: "space-between",
  },
  reasonTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary.palest,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
