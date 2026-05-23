import { ArrowRight, PenLine } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Pressable, View as RNView, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import {
  getThemeNameFromColor,
  PracticeTheme,
  practiceThemeColorMap,
} from "@/constants/practice-theme";
import { getStatusConfig, TaskStatus } from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import type { IInProgressTask } from "@/hooks/usePractices";
import { useMobileTranslation } from "@/i18n";

interface InProgressCardProps {
  task: IInProgressTask;
}

const statusLabelKey: Record<TaskStatus, string> = {
  [TaskStatus.draft]: "filter_draft",
  [TaskStatus.notStarted]: "filter_not_started",
  [TaskStatus.inProgress]: "filter_in_progress",
  [TaskStatus.completed]: "filter_completed",
};

export function InProgressCard({ task }: InProgressCardProps) {
  const router = useRouter();
  const t = useMobileTranslation("mobile.home");
  const { id, label, title, description, checkInCount, progress, theme, status } = task;

  const themeName = getThemeNameFromColor(theme);
  const themeColor =
    practiceThemeColorMap[themeName] ?? practiceThemeColorMap[PracticeTheme.yellow];
  const statusInfo = getStatusConfig(status);
  const isDraft = status === TaskStatus.draft;

  const handleCheckIn = () => {
    router.push(`/practices/${id}` as `/practices/${string}`);
  };

  const handleEdit = () => {
    router.push(`/practices/${id}/edit` as `/practices/${string}/edit`);
  };

  return (
    <Pressable
      style={[styles.card, { backgroundColor: themeColor }]}
      onPress={() => router.push(`/practices/${id}` as `/practices/${string}`)}
    >
      <YStack flex={1} padding="$4" paddingBottom="$5" gap="$4">
        <YStack flex={1} gap="$2">
          {/* Badges */}
          <XStack justifyContent="space-between" gap="$2">
            <View style={styles.badgeSecondary}>
              <Text fontSize={12} color={colors.text.dark}>
                {label}
              </Text>
            </View>
            {statusInfo && (
              <View
                style={[
                  styles.badge,
                  status === TaskStatus.inProgress ? styles.badgeActive : styles.badgeDefault,
                ]}
              >
                <Text
                  fontSize={12}
                  color={status === TaskStatus.inProgress ? "white" : colors.text.dark}
                >
                  {t(statusLabelKey[status] ?? "filter_in_progress")}
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
              <YStack flex={1}>
                <Text fontSize={12} color={colors.text.dark} numberOfLines={2}>
                  {description}
                </Text>
              </YStack>
            </YStack>
            <View style={{ alignSelf: "center" }}>
              <ArrowRight size={24} color="#9CA3AF" />
            </View>
          </XStack>
        </YStack>

        {/* Check-in count + messages (hidden) */}
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap="$1">
            <Text fontSize={12} color={colors.text.dark}>
              {t("checked_in")}
            </Text>
            <Text fontSize={12} fontWeight="600" color={colors.text.dark}>
              {checkInCount}
            </Text>
            <Text fontSize={12} color={colors.text.dark}>
              {t("stats_times_unit")}
            </Text>
          </XStack>
          {/* TODO: MVP 先不開放 — aligned with product */}
          {/* <XStack alignItems="center" gap="$1">
            <MessageSquare size={16} color={colors.text.dark} />
            <Text fontSize={12} fontWeight="600" color={colors.text.dark}>{messagesCount}</Text>
          </XStack> */}
        </XStack>

        {/* Check-in / Edit button */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            isDraft ? handleEdit() : handleCheckIn();
          }}
          style={styles.actionButton}
        >
          {isDraft ? (
            <XStack alignItems="center" justifyContent="center" gap="$2">
              <PenLine size={18} color="#16B9B3" />
              <Text fontSize={14} fontWeight="600" color={colors.text.dark}>
                {t("continue_editing")}
              </Text>
            </XStack>
          ) : (
            <Text fontSize={14} fontWeight="600" color={colors.text.dark} textAlign="center">
              {t("check_in")}
            </Text>
          )}
        </Pressable>
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
    minHeight: 260,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSecondary: {
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: "#16B9B3",
  },
  badgeDefault: {
    backgroundColor: "white",
  },
  actionButton: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#16B9B3",
    borderRadius: 3,
  },
});
