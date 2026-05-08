import { Pressable, StyleSheet } from "react-native";
import { ScrollView, Text } from "tamagui";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";

const filterOptions = [
  { value: FilterStatus.all, label: "全部" },
  { value: FilterStatus.draft, label: "草稿" },
  { value: FilterStatus.notStarted, label: "未開始" },
  { value: FilterStatus.inProgress, label: "進行中" },
  { value: FilterStatus.completed, label: "已完成" },
];

interface FilterPillsProps {
  activeFilter: FilterStatusType;
  onFilterChange: (filter: FilterStatusType) => void;
  counts?: Partial<Record<FilterStatusType, number>>;
}

export function FilterPills({ activeFilter, onFilterChange, counts }: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      marginBottom="$4"
    >
      {filterOptions.map((option) => {
        const isActive = activeFilter === option.value;
        const count = counts?.[option.value];
        return (
          <Pressable
            key={option.value}
            onPress={() => onFilterChange(option.value)}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
          >
            <Text fontSize={14} color={isActive ? "white" : "#16B9B3"}>
              {option.label}
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
