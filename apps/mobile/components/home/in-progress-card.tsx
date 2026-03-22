import { ArrowRight } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View as RNView } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { getStatusConfig } from "@/constants/task-status";
import { practiceThemeColorMap, PracticeTheme } from "@/constants/practice-theme";
import type { InProgressTask } from "@/hooks/usePractices";

interface InProgressCardProps {
  task: InProgressTask;
}

export function InProgressCard({ task }: InProgressCardProps) {
  const router = useRouter();
  const { id, label, title, description, checkInCount, progress, theme, status } = task;

  // theme is a theme name (e.g. "yellow"), use directly as PracticeTheme or fall back
  const themeName = (Object.values(PracticeTheme) as string[]).includes(theme)
    ? (theme as PracticeTheme)
    : PracticeTheme.yellow;
  const themeColor = practiceThemeColorMap[themeName] ?? practiceThemeColorMap[PracticeTheme.yellow];
  const statusInfo = getStatusConfig(status);

  return (
    <Pressable
      style={[styles.card, { backgroundColor: themeColor }]}
      onPress={() => router.push(`/practices/${id}` as any)}
    >
      <YStack flex={1} padding="$4" paddingBottom="$5" gap="$4">
        <YStack flex={1} gap="$2">
          {/* Badges */}
          <XStack justifyContent="space-between" gap="$2">
            <View style={styles.badge}>
              <Text fontSize={12} color={colors.text.dark}>{label}</Text>
            </View>
            {statusInfo && (
              <View style={[styles.badge, { backgroundColor: status === "in-progress" ? "#16B9B3" : "white" }]}>
                <Text fontSize={12} color={status === "in-progress" ? "white" : colors.text.dark}>
                  {statusInfo.label}
                </Text>
              </View>
            )}
          </XStack>

          {/* Title + description + arrow */}
          <XStack justifyContent="space-between" gap="$2" flex={1}>
            <YStack flex={1} gap="$2">
              <Text fontSize={20} fontWeight="500" color={colors.text.dark} numberOfLines={1}>
                {title}
              </Text>
              <Text fontSize={12} color={colors.text.dark} numberOfLines={2} flex={1}>
                {description}
              </Text>
            </YStack>
            <View style={{ alignSelf: "center" }}>
              <ArrowRight size={24} color="#9CA3AF" />
            </View>
          </XStack>
        </YStack>

        {/* Check-in count */}
        <XStack alignItems="center" gap="$1">
          <Text fontSize={12} color={colors.text.dark}>已打卡</Text>
          <Text fontSize={12} fontWeight="600" color={colors.text.dark}>{checkInCount}</Text>
          <Text fontSize={12} color={colors.text.dark}>次</Text>
        </XStack>
      </YStack>

      {/* Progress bar */}
      <RNView style={styles.progressContainer}>
        <RNView style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
      </RNView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 294,
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 220,
  },
  badge: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#16B9B3",
    borderRadius: 3,
  },
});
