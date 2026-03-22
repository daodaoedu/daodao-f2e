import { ArrowRight } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { CompletedTask } from "@/hooks/usePractices";

interface CompletedCardProps {
  task: CompletedTask;
}

export function CompletedCard({ task }: CompletedCardProps) {
  const router = useRouter();
  const { id, label, title, description, tags } = task;

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
      <XStack gap="$2" marginVertical="$1.5">
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

      {/* Progress indicator (completed = full) */}
      <View style={styles.progressFull} />
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
  progressFull: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#3B82F6",
    width: "100%",
  },
});
