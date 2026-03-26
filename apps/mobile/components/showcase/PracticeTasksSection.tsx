/**
 * PracticeTasksSection
 *
 * 「我的」Tab 的實踐任務清單，供首頁與靈感頁共用。
 * 包含 FilterPills、橫向進行中清單、縱向已完成清單與空狀態。
 */
import { FlatList } from "react-native";
import { Text, YStack } from "tamagui";
import { CompletedCard, FilterPills, InProgressCard } from "@/components/home";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import type { ICompletedTask, IInProgressTask } from "@/hooks/usePractices";

interface PracticeTasksSectionProps {
  filterStatus: FilterStatusType;
  onFilterChange: (status: FilterStatusType) => void;
  filteredInProgressTasks: IInProgressTask[];
  showInProgress: boolean;
  showCompleted: boolean;
  completedTasks: ICompletedTask[];
  isEmpty: boolean;
  emptyMessage?: string;
}

export function PracticeTasksSection({
  filterStatus,
  onFilterChange,
  filteredInProgressTasks,
  showInProgress,
  showCompleted,
  completedTasks,
  isEmpty,
  emptyMessage = "還沒有任何實踐，快去建立第一個吧！",
}: PracticeTasksSectionProps) {
  return (
    <YStack paddingHorizontal="$4">
      <FilterPills activeFilter={filterStatus} onFilterChange={onFilterChange} />

      {showInProgress && filteredInProgressTasks.length > 0 && (
        <FlatList
          horizontal
          data={filteredInProgressTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <InProgressCard task={item} />}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        />
      )}

      {showCompleted && completedTasks.length > 0 && (
        <YStack gap="$3" marginBottom="$4">
          <Text fontSize={18} fontWeight="500" color={colors.text.dark}>
            已完成
          </Text>
          {completedTasks.map((task) => (
            <CompletedCard key={task.id} task={task} />
          ))}
        </YStack>
      )}

      {isEmpty && (
        <YStack alignItems="center" paddingVertical="$8">
          <Text color="rgba(0,0,0,0.5)" fontSize={14}>
            {emptyMessage}
          </Text>
        </YStack>
      )}
    </YStack>
  );
}

export { FilterStatus };
