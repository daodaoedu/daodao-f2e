import { MessageCircle, MoreHorizontal } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { getStatusConfig } from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import { removeReaction, upsertReaction } from "@/hooks/useReactions";
import type { IShowcasePractice } from "@/hooks/useShowcaseFeed";

interface ShowcaseCardProps {
  practice: IShowcasePractice;
  extraContent?: ReactNode;
  /** 外部控制的已選反應（傳入時啟用 controlled mode） */
  selectedReaction?: ReactionTypeType | null;
  /** 外部覆寫反應切換 handler */
  onReactionToggle?: (type: ReactionTypeType) => Promise<void>;
  /** 反應按鈕被點擊時觸發（用於 haptic 等副作用，不影響內部狀態） */
  onReactionTap?: () => void;
  /** 三點選單 callback */
  onMenuPress?: () => void;
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function ShowcaseCard({
  practice,
  extraContent,
  selectedReaction: externalSelectedReaction,
  onReactionToggle: externalOnReactionToggle,
  onReactionTap,
  onMenuPress,
}: ShowcaseCardProps) {
  const router = useRouter();
  const {
    id,
    title,
    status,
    start_date,
    end_date,
    user,
    practice_action,
    frequency_min_days,
    frequency_max_days,
    session_duration_minutes,
    comment_count = 0,
  } = practice;

  const { reactions = [] } = practice;
  const inlineTotalCount = reactions.reduce((sum, r) => sum + r.count, 0);
  const inlineDisplayReactions = reactions
    .filter((r) => r.count > 0)
    .map((r) => r.type as ReactionTypeType);
  const inlineFirstReactorName = reactions.find((r) => r.count > 0)?.latestActorName;

  const [internalReaction, setInternalReaction] = useState<ReactionTypeType | null>(null);

  // Controlled mode（外部提供 handler）或 uncontrolled（自行管理狀態）
  const currentUserReaction =
    externalOnReactionToggle !== undefined ? (externalSelectedReaction ?? null) : internalReaction;

  const internalHandleReactionToggle = useCallback(
    async (type: ReactionTypeType) => {
      const isSelected = internalReaction === type;
      setInternalReaction(isSelected ? null : type);
      onReactionTap?.();
      try {
        if (isSelected) {
          await removeReaction("practice", id);
        } else {
          await upsertReaction("practice", id, type);
        }
      } catch {
        setInternalReaction(isSelected ? type : null);
      }
    },
    [internalReaction, id, onReactionTap]
  );

  const handleReactionToggle = externalOnReactionToggle ?? internalHandleReactionToggle;

  const taskStatus = status === "active" ? "in-progress" : "completed";
  const statusInfo = getStatusConfig(taskStatus);
  const startFmt = formatDate(start_date);
  const endFmt = formatDate(end_date);

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/practices/[id]",
          params: { id, showcaseData: JSON.stringify(practice) },
        })
      }
    >
      {/* Header row */}
      <XStack alignItems="center" gap="$2" marginBottom="$2">
        {statusInfo && (
          <View
            style={[
              styles.badge,
              { backgroundColor: taskStatus === "completed" ? "#6B7280" : colors.primary.base },
            ]}
          >
            <Text fontSize={12} color="white">
              {statusInfo.label}
            </Text>
          </View>
        )}
        {startFmt && endFmt && (
          <Text fontSize={12} color="rgba(0,0,0,0.5)" flex={1}>
            {startFmt} ▶ {endFmt}
          </Text>
        )}
        <Pressable hitSlop={8} onPress={onMenuPress}>
          <MoreHorizontal size={16} color="#9CA3AF" />
        </Pressable>
      </XStack>

      {/* Title */}
      <Text
        fontSize={16}
        fontWeight="600"
        color={colors.text.dark}
        marginBottom="$2"
        numberOfLines={2}
      >
        {title}
      </Text>

      {/* Avatar + action/frequency */}
      {(user || practice_action || frequency_min_days || session_duration_minutes) && (
        <XStack gap="$3" marginBottom="$3" alignItems="flex-start">
          {user && (
            <View style={styles.avatar}>
              {user.photo_url ? (
                <Image source={{ uri: user.photo_url }} style={styles.avatarImage} />
              ) : (
                <Text fontSize={20} color="#9CA3AF">
                  {(user.name ?? "?")[0]}
                </Text>
              )}
            </View>
          )}
          <YStack flex={1}>
            {practice_action && (
              <Text fontSize={14} color="rgba(0,0,0,0.8)" marginBottom="$2" numberOfLines={3}>
                {practice_action}
              </Text>
            )}
            <XStack gap="$4">
              {(frequency_min_days || frequency_max_days) && (
                <XStack alignItems="center">
                  <Text fontSize={14} fontWeight="600" color="#16B9B3">
                    {frequency_min_days === frequency_max_days
                      ? frequency_min_days
                      : `${frequency_min_days}-${frequency_max_days}`}
                  </Text>
                  <Text fontSize={14} color="rgba(0,0,0,0.6)" marginLeft={2}>
                    天/週
                  </Text>
                </XStack>
              )}
              {session_duration_minutes && (
                <XStack alignItems="center">
                  <Text fontSize={14} fontWeight="600" color="#16B9B3">
                    {session_duration_minutes}
                  </Text>
                  <Text fontSize={14} color="rgba(0,0,0,0.6)" marginLeft={2}>
                    分鐘/次
                  </Text>
                </XStack>
              )}
            </XStack>
          </YStack>
        </XStack>
      )}

      {extraContent}

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <ReactionPickerButton
          selectedReaction={currentUserReaction}
          onToggle={handleReactionToggle}
          variant="summary"
          totalCount={inlineTotalCount}
          displayReactions={inlineDisplayReactions}
          firstReactorName={inlineFirstReactorName}
        />
        <XStack alignItems="center" gap="$1.5">
          <MessageCircle size={20} color="#9FB5B8" />
          {comment_count > 0 && (
            <Text fontSize={14} fontWeight="500" color="#9FB5B8">
              {comment_count}
            </Text>
          )}
        </XStack>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8F8FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: "#E4EAE9",
    paddingTop: 12,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
