/**
 * PracticeTasksSection
 *
 * 「我的」Tab 的實踐任務清單，供首頁與靈感頁共用。
 * 對齊 product：所有狀態的實踐都用同一種卡片，放在單一橫向 carousel（不再獨立「已完成」區塊）。
 */
import { FlatList } from "react-native";
import { Text, YStack } from "tamagui";
import { FilterPills, InProgressCard } from "@/components/home";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import type { IInProgressTask } from "@/hooks/usePractices";
import { useMobileTranslation } from "@/i18n";

interface PracticeTasksSectionProps {
  /** 所有實踐（統一形狀，含已完成），由本元件依 filterStatus 篩選 */
  tasks: IInProgressTask[];
  filterStatus: FilterStatusType;
  onFilterChange: (status: FilterStatusType) => void;
  emptyMessage?: string;
  counts?: Partial<Record<FilterStatusType, number>>;
}

export function PracticeTasksSection({
  tasks,
  filterStatus,
  onFilterChange,
  emptyMessage,
  counts,
}: PracticeTasksSectionProps) {
  const t = useMobileTranslation("mobile.home");

  const filteredTasks =
    filterStatus === FilterStatus.all
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);

  return (
    <YStack paddingHorizontal="$4">
      <FilterPills activeFilter={filterStatus} onFilterChange={onFilterChange} counts={counts} />

      {filteredTasks.length > 0 ? (
        <FlatList
          horizontal
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <InProgressCard task={item} />}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        />
      ) : (
        <YStack alignItems="center" paddingVertical="$8">
          <Text color="rgba(0,0,0,0.5)" fontSize={14}>
            {emptyMessage ?? t("empty_practices")}
          </Text>
        </YStack>
      )}
    </YStack>
  );
}

export { FilterStatus };
