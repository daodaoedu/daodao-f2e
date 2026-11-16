/**
 * PracticeTasksSection
 *
 * 「我的」Tab 的實踐任務清單，供首頁與靈感頁共用。
 * 所有狀態實踐沿用單一橫向 carousel，並加入共同挑戰卡片。
 */
import { FlatList } from "react-native";
import { Text, YStack } from "tamagui";
import { FilterPills, InProgressCard } from "@/components/home";
import { CommunityChallengeCard } from "@/components/home/community-challenge-card";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import type { IChallenge } from "@/hooks/useChallenges";
import type { IInProgressTask } from "@/hooks/usePractices";
import { useMobileTranslation } from "@/i18n";

type HorizontalItem =
  | { type: "practice"; data: IInProgressTask }
  | { type: "challenge"; data: IChallenge };

interface PracticeTasksSectionProps {
  /** 所有實踐（統一形狀，含已完成），由本元件依 filterStatus 篩選 */
  tasks: IInProgressTask[];
  filterStatus: FilterStatusType;
  onFilterChange: (status: FilterStatusType) => void;
  emptyMessage?: string;
  counts?: Partial<Record<FilterStatusType, number>>;
  challenges?: IChallenge[];
}

export function PracticeTasksSection({
  tasks,
  filterStatus,
  onFilterChange,
  emptyMessage,
  counts,
  challenges = [],
}: PracticeTasksSectionProps) {
  const t = useMobileTranslation("mobile.home");

  const filteredTasks =
    filterStatus === FilterStatus.all
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);
  const visibleChallenges = filterStatus === FilterStatus.completed ? [] : challenges;
  const horizontalItems: HorizontalItem[] = [
    ...visibleChallenges.map(
      (challenge): HorizontalItem => ({ type: "challenge", data: challenge })
    ),
    ...filteredTasks.map((task): HorizontalItem => ({ type: "practice", data: task })),
  ];

  return (
    <YStack paddingHorizontal="$4">
      <FilterPills activeFilter={filterStatus} onFilterChange={onFilterChange} counts={counts} />

      {horizontalItems.length > 0 ? (
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
