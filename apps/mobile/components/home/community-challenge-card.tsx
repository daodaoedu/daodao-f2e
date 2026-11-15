import { Pressable, View as RNView, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { IChallenge } from "@/hooks/useChallenges";
import { impactLight } from "@/utils/haptics";

interface CommunityChallengeCardProps {
  challenge: IChallenge;
  onJoin?: (id: string) => void;
}

export function CommunityChallengeCard({ challenge, onJoin }: CommunityChallengeCardProps) {
  const { id, title, description, statusLabel, period, participantCount, participants } = challenge;

  return (
    <RNView style={styles.card}>
      <YStack flex={1} padding="$4" gap="$3">
        {/* Top badges + period */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$2">
            <View style={styles.badgeOutline}>
              <Text fontSize={12} color={colors.text.dark}>
                共同挑戰
              </Text>
            </View>
            <View style={styles.badgeDraft}>
              <Text fontSize={12} color="#F97316">
                {statusLabel}
              </Text>
            </View>
          </XStack>
          <Text fontSize={12} color={colors.text.dark}>
            期間: {period.start} - {period.end}
          </Text>
        </XStack>

        {/* Title */}
        <Text fontSize={20} fontWeight="700" color={colors.text.dark}>
          🏆 {title}
        </Text>

        {/* Description */}
        <Text fontSize={13} color={colors.text.dark} lineHeight={20}>
          {description}
        </Text>

        {/* Participants */}
        <XStack alignItems="center" gap="$2">
          <XStack>
            {participants.slice(0, 3).map((p, i) => (
              <RNView
                key={p.id}
                style={[
                  styles.avatar,
                  { backgroundColor: p.avatarColor, marginLeft: i === 0 ? 0 : -8 },
                ]}
              />
            ))}
          </XStack>
          <Text fontSize={13} color={colors.text.dark}>
            有{" "}
            <Text fontSize={13} fontWeight="700" color={colors.text.dark}>
              {participantCount}
            </Text>{" "}
            位夥伴努力中
          </Text>
        </XStack>

        {/* Join button */}
        <Pressable
          style={styles.joinButton}
          onPress={() => {
            impactLight();
            onJoin?.(id);
          }}
        >
          <Text fontSize={15} fontWeight="700" color="white" textAlign="center">
            ✦ 馬上加入
          </Text>
        </Pressable>

        {/* Unlock note */}
        <XStack justifyContent="center" alignItems="center" gap="$1">
          <Text fontSize={12} color="#9CA3AF">
            💬 加入即可解鎖{" "}
          </Text>
          <Text fontSize={12} color={colors.primary.base} fontWeight="600">
            專屬留言交流
          </Text>
        </XStack>
      </YStack>
    </RNView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 294,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF3E8",
    minHeight: 260,
  },
  badgeOutline: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "white",
  },
  badgeDraft: {
    borderWidth: 1,
    borderColor: "#F97316",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "white",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "white",
  },
  joinButton: {
    backgroundColor: "#F97316",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
});
