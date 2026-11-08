/**
 * PracticeTasksSection
 *
 * 「我的」Tab 的實踐任務清單，供首頁與靈感頁共用。
 * 包含 FilterPills、橫向進行中清單（含共同挑戰卡）、縱向已完成清單與空狀態。
 */
import { FlatList } from "react-native";
import { Text, YStack } from "tamagui";
import { CompletedCard, FilterPills, InProgressCard } from "@/components/home";
import { CommunityChallengeCard } from "@/components/home/community-challenge-card";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import type { IChallenge } from "@/hooks/useChallenges";
import type { ICompletedTask, IInProgressTask } from "@/hooks/usePractices";

type HorizontalItem =
  | { type: "practice"; data: IInProgressTask }
  | { type: "challenge"; data: IChallenge };

interface PracticeTasksSectionProps {
  filterStatus: FilterStatusType;
  onFilterChange: (status: FilterStatusType) => void;
  filteredInProgressTasks: IInProgressTask[];
  showInProgress: boolean;
  showCompleted: boolean;
  completedTasks: ICompletedTask[];
  isEmpty: boolean;
  emptyMessage?: string;
  challenges?: IChallenge[];
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
  challenges = [],
}: PracticeTasksSectionProps) {
  const horizontalItems: HorizontalItem[] = [
    ...challenges.map((c): HorizontalItem => ({ type: "challenge", data: c })),
    ...filteredInProgressTasks.map((t): HorizontalItem => ({ type: "practice", data: t })),
  ];

  return (
    <YStack paddingHorizontal="$4">
      <FilterPills activeFilter={filterStatus} onFilterChange={onFilterChange} />

      {showInProgress && horizontalItems.length > 0 && (
        <FlatList
          horizontal
          data={horizontalItems}
          keyExtractor={(item) => `${item.type}-${item.data.id}`}
          renderItem={({ item }) =>
            item.type === "challenge" ? (
              <CommunityChallengeCard challenge={item.data} />
            ) : (
              <InProgressCard task={item.data} />
            )
          }
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

      {isEmpty && challenges.length === 0 && (
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
