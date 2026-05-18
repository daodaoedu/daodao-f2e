import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import { ShowcaseSearchBar, TabSwitcher, type TabType } from "@/components/home";
import { PracticeShowcaseCard } from "@/components/showcase/PracticeShowcaseCard";
import { PracticeTasksSection } from "@/components/showcase/PracticeTasksSection";
import { ShowcaseFeed } from "@/components/showcase/ShowcaseFeed";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import { usePractices } from "@/hooks/usePractices";
import {
  type IShowcaseFeedParams,
  type IShowcasePractice,
  useShowcaseFeed,
} from "@/hooks/useShowcaseFeed";

export default function ShowcaseScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("inspire");

  // ── Inspire tab state ──
  const [searchValue, setSearchValue] = useState("");
  const [keyword, setKeyword] = useState("");

  const feedParams: IShowcaseFeedParams = useMemo(
    () => ({ keyword: keyword || undefined, sort_by: "newest_updated" }),
    [keyword]
  );

  const { practices, isLoading, hasMore, loadMore, isValidating, mutate } =
    useShowcaseFeed(feedParams);

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  // ── Mine tab state ──
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>(FilterStatus.all);
  const {
    inProgressTasks,
    completedTasks,
    isLoading: isMyLoading,
    mutate: mutatePractices,
  } = usePractices();

  const filteredInProgressTasks = useMemo(() => {
    if (filterStatus === FilterStatus.completed) return [];
    if (filterStatus === FilterStatus.all) return inProgressTasks;
    return inProgressTasks.filter((task) => task.status === filterStatus);
  }, [inProgressTasks, filterStatus]);

  const showCompleted =
    filterStatus === FilterStatus.all || filterStatus === FilterStatus.completed;
  const showInProgress = filterStatus !== FilterStatus.completed;

  // ── Inspire tab render ──
  const renderShowcaseItem = useCallback(
    ({ item }: { item: IShowcasePractice }) => (
      <PracticeShowcaseCard
        practice={item}
        onReactionUpdated={async () => {
          await mutate();
        }}
      />
    ),
    [mutate]
  );

  const renderShowcaseHeader = useCallback(
    () => (
      <YStack paddingHorizontal="$4" paddingTop="$4">
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        <YStack marginBottom="$3">
          <ShowcaseSearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
          />
        </YStack>
      </YStack>
    ),
    [activeTab, searchValue, handleSearch]
  );

  // ── Main render ──
  if (activeTab === "inspire") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ShowcaseFeed
          practices={practices}
          isLoading={isLoading}
          isValidating={isValidating}
          hasMore={hasMore}
          loadMore={loadMore}
          onRefresh={mutate}
          renderItem={renderShowcaseItem}
          renderHeader={renderShowcaseHeader}
        />
      </SafeAreaView>
    );
  }

  // Mine tab
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            <YStack paddingHorizontal="$4" paddingTop="$4">
              <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
            </YStack>
            {isMyLoading ? (
              <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$8">
                <Text color={colors.text.dark}>載入中...</Text>
              </YStack>
            ) : (
              <PracticeTasksSection
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                filteredInProgressTasks={filteredInProgressTasks}
                showInProgress={showInProgress}
                showCompleted={showCompleted}
                completedTasks={completedTasks}
                isEmpty={inProgressTasks.length === 0 && completedTasks.length === 0}
              />
            )}
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => mutatePractices()}
            tintColor={colors.primary.base}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
});
