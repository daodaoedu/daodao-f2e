import { format } from "date-fns";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

interface IStat {
  label: string;
  value: string;
  unit: string;
  icon?: ReactNode;
}

interface DashboardHeaderProps {
  stats: IStat[];
}

function StatCard({ label, value, unit, icon }: IStat) {
  return (
    <View style={styles.statCard}>
      <YStack flex={1}>
        <Text fontSize={14} color={colors.text.dark}>
          {label}
        </Text>
        <XStack alignItems="flex-end" gap="$1">
          <Text fontSize={28} fontWeight="600" color="#16B9B3" lineHeight={32}>
            {value}
          </Text>
          <Text fontSize={14} color={colors.text.dark} marginBottom={2}>
            {unit}
          </Text>
        </XStack>
      </YStack>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </View>
  );
}

export function DashboardHeader({ stats }: DashboardHeaderProps) {
  const today = new Date();

  return (
    <YStack paddingTop="$4" marginBottom="$4">
      {/* Date display */}
      <YStack marginBottom="$3">
        <Text fontSize={22} color="#9CA3AF">
          {format(today, "yyyy")}
        </Text>
        <XStack gap="$2">
          <XStack alignItems="center" gap="$1">
            <Text fontSize={36} fontWeight="600" color={colors.text.dark}>
              {format(today, "M")}
            </Text>
            <Text fontSize={22} fontWeight="500" color={colors.text.dark}>
              月
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$1">
            <Text fontSize={36} fontWeight="600" color={colors.text.dark}>
              {format(today, "d")}
            </Text>
            <Text fontSize={22} fontWeight="500" color={colors.text.dark}>
              日
            </Text>
          </XStack>
        </XStack>
      </YStack>

      {/* Stats */}
      <XStack gap="$3">
        {stats.map((stat) => (
          <View key={stat.label} style={{ flex: 1 }}>
            <StatCard {...stat} />
          </View>
        ))}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderLeftWidth: 6,
    borderLeftColor: "#A5E9E5",
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  iconContainer: {
    position: "absolute",
    right: 8,
    top: 8,
    opacity: 0.15,
  },
});
