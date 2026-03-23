import { ArrowRight, Eye, MessageSquare } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View as RNView } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { CompletedTask } from "@/hooks/usePractices";

interface CompletedCardProps {
  task: CompletedTask;
}

export function CompletedCard({ task }: CompletedCardProps) {
  const router = useRouter();
  const { id, label, title, description, viewCount, commentCount, tags } = task;

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/practices/${id}` as any)}
    >
      {/* Label + tags */}
      <XStack justifyContent="space-between" gap="$1">
        <View style={styles.labelBadge}>
          <Text fontSize={12} color="#16B9B3">{label}</Text>
        </View>
        <XStack gap="$2" flexWrap="wrap">
          {tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tagBadge}>
              <Text fontSize={12} color="#6B7280">{tag}</Text>
            </View>
          ))}
          {tags.length > 2 && (
            <Text fontSize={12} color="#9CA3AF" paddingVertical={2}>+{tags.length - 2}</Text>
          )}
        </XStack>
      </XStack>

      {/* Title + description + arrow */}
      <XStack gap="$2" marginBottom="$1.5">
        <YStack flex={1}>
          <Text fontSize={16} fontWeight="500" color={colors.text.dark} marginBottom="$1">
            {title}
          </Text>
          <Text fontSize={12} color={colors.text.dark}>{description}</Text>
        </YStack>
        <View style={{ alignSelf: "center" }}>
          <ArrowRight size={24} color="#9CA3AF" />
        </View>
      </XStack>

      {/* Progress line (completed = full blue) */}
      <RNView style={styles.progressLine} />

      {/* Engagement Stats — hidden, aligned with product */}
      {/* <XStack gap="$3" alignItems="center">
        <XStack alignItems="center" gap="$1">
          <Eye size={16} color={colors.text.dark} />
          <Text fontSize={12} color={colors.text.dark}>{viewCount}</Text>
        </XStack>
        <XStack alignItems="center" gap="$1">
          <MessageSquare size={16} color={colors.text.dark} />
          <Text fontSize={12} color={colors.text.dark}>{commentCount}</Text>
        </XStack>
      </XStack> */}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  labelBadge: {
    borderWidth: 1,
    borderColor: "#16B9B3",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  progressLine: {
    height: 1.5,
    borderRadius: 999,
    backgroundColor: "#3B82F6",
    width: "100%",
  },
});
