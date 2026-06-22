import { Pressable, StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { useMobileTranslation } from "@/i18n";

const DURATION_OPTIONS = [
  { labelKey: "duration_7", min: 1, max: 7 },
  { labelKey: "duration_14", min: 8, max: 14 },
  { labelKey: "duration_21", min: 15, max: 21 },
  { labelKey: "duration_30", min: 22, max: 30 },
];

const STATUS_OPTIONS = [
  { labelKey: "status_active", value: "active" as const },
  { labelKey: "status_completed", value: "completed" as const },
];

export interface IShowcaseFilterState {
  tags: string[];
  durationMin?: number;
  durationMax?: number;
  status?: "active" | "completed";
}

interface ShowcaseFilterBarProps {
  filters: IShowcaseFilterState;
  onFiltersChange: (filters: IShowcaseFilterState) => void;
}

export function ShowcaseFilterBar({ filters, onFiltersChange }: ShowcaseFilterBarProps) {
  const t = useMobileTranslation("mobile.showcaseFilter");

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
        <Text fontSize={12} color="rgba(0,0,0,0.5)" marginBottom="$1.5">
          {t("status")}
        </Text>
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
                  {t(opt.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </XStack>
      </YStack>

      {/* Duration filter */}
      <YStack>
        <Text fontSize={12} color="rgba(0,0,0,0.5)" marginBottom="$1.5">
          {t("duration")}
        </Text>
        <XStack gap="$2" flexWrap="wrap">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = filters.durationMin === opt.min && filters.durationMax === opt.max;
            return (
              <Pressable
                key={opt.labelKey}
                onPress={() => toggleDuration(opt.min, opt.max)}
                style={[styles.pill, isSelected ? styles.pillActive : styles.pillInactive]}
              >
                <Text fontSize={14} color={isSelected ? "white" : "#1a1a1a"}>
                  {t(opt.labelKey)}
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
