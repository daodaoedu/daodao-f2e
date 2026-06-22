import { Pressable, StyleSheet } from "react-native";
import { ScrollView, Text } from "tamagui";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { useMobileTranslation } from "@/i18n";

const filterOptions = [
  { value: FilterStatus.all, labelKey: "filter_all" },
  { value: FilterStatus.draft, labelKey: "filter_draft" },
  { value: FilterStatus.notStarted, labelKey: "filter_not_started" },
  { value: FilterStatus.inProgress, labelKey: "filter_in_progress" },
  { value: FilterStatus.completed, labelKey: "filter_completed" },
];

interface FilterPillsProps {
  activeFilter: FilterStatusType;
  onFilterChange: (filter: FilterStatusType) => void;
  counts?: Partial<Record<FilterStatusType, number>>;
}

export function FilterPills({ activeFilter, onFilterChange, counts }: FilterPillsProps) {
  const t = useMobileTranslation("mobile.home");
  const safeCounts = counts ?? {};
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      marginBottom="$4"
    >
      {filterOptions.map((option) => {
        const isActive = activeFilter === option.value;
        const count = safeCounts[option.value];
        return (
          <Pressable
            key={option.value}
            onPress={() => onFilterChange(option.value)}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
          >
            <Text fontSize={14} color={isActive ? "white" : "#16B9B3"}>
              {t(option.labelKey)}
              {count !== undefined ? ` ${count}` : ""}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: "#16B9B3",
    borderColor: "#16B9B3",
  },
  pillInactive: {
    backgroundColor: "white",
    borderColor: "#16B9B3",
  },
});
