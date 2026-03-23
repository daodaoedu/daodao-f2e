import { Pressable, StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const DURATION_OPTIONS = [
  { label: "7 天", min: 1, max: 7 },
  { label: "14 天", min: 8, max: 14 },
  { label: "21 天", min: 15, max: 21 },
  { label: "30 天", min: 22, max: 30 },
];

const STATUS_OPTIONS = [
  { label: "進行中", value: "active" as const },
  { label: "已完成", value: "completed" as const },
];

export interface ShowcaseFilterState {
  tags: string[];
  durationMin?: number;
  durationMax?: number;
  status?: "active" | "completed";
}

interface ShowcaseFilterBarProps {
  filters: ShowcaseFilterState;
  onFiltersChange: (filters: ShowcaseFilterState) => void;
}

export function ShowcaseFilterBar({ filters, onFiltersChange }: ShowcaseFilterBarProps) {
  const toggleStatus = (value: "active" | "completed") => {
    onFiltersChange({
      ...filters,
      status: filters.status === value ? undefined : value,
    });
  };

  const toggleDuration = (min: number, max: number) => {
    const isSelected = filters.durationMin === min && filters.durationMax === max;
    onFiltersChange({
      ...filters,
      durationMin: isSelected ? undefined : min,
      durationMax: isSelected ? undefined : max,
    });
  };

  return (
    <YStack gap="$3" paddingTop="$2">
      {/* Status filter */}
      <YStack>
        <Text fontSize={12} color="rgba(0,0,0,0.5)" marginBottom="$1.5">狀態</Text>
        <XStack gap="$2" flexWrap="wrap">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = filters.status === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => toggleStatus(opt.value)}
                style={[styles.pill, isSelected ? styles.pillActive : styles.pillInactive]}
              >
                <Text fontSize={14} color={isSelected ? "white" : "#1a1a1a"}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </XStack>
      </YStack>

      {/* Duration filter */}
      <YStack>
        <Text fontSize={12} color="rgba(0,0,0,0.5)" marginBottom="$1.5">實踐週期</Text>
        <XStack gap="$2" flexWrap="wrap">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = filters.durationMin === opt.min && filters.durationMax === opt.max;
            return (
              <Pressable
                key={opt.label}
                onPress={() => toggleDuration(opt.min, opt.max)}
                style={[styles.pill, isSelected ? styles.pillActive : styles.pillInactive]}
              >
                <Text fontSize={14} color={isSelected ? "white" : "#1a1a1a"}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </XStack>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: "#16B9B3",
    borderColor: "#16B9B3",
  },
  pillInactive: {
    backgroundColor: "white",
    borderColor: "#C1ECFF",
  },
});
