import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, View as RNView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import {
  CompletedCard,
  FilterPills,
  InProgressCard,
  ShowcaseSearchBar,
  TabSwitcher,
  type TabType,
} from "@/components/home";
import { PracticeShowcaseCard } from "@/components/showcase/PracticeShowcaseCard";
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
    () => ({
      keyword: keyword || undefined,
      sort_by: "newest_updated",
    }),
    [keyword]
  );

  const {
    practices,
    isLoading: isShowcaseLoading,
    hasMore,
    loadMore,
    isValidating,
    mutate: mutateShowcase,
  } = useShowcaseFeed(feedParams);

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
    ({ item }: { item: IShowcasePractice }) => <PracticeShowcaseCard practice={item} />,
    []
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

  const renderShowcaseFooter = useCallback(
    () =>
      isValidating ? (
        <Text textAlign="center" paddingVertical="$4" color="rgba(0,0,0,0.5)" fontSize={14}>
          載入中...
        </Text>
      ) : null,
    [isValidating]
  );

  const renderShowcaseEmpty = useCallback(
    () =>
      !isShowcaseLoading ? (
        <YStack alignItems="center" paddingVertical="$8">
          <Text color="rgba(0,0,0,0.5)" fontSize={14}>
            沒有找到相關實踐
          </Text>
        </YStack>
      ) : null,
    [isShowcaseLoading]
  );

  // ── Mine tab render ──
  const renderMineContent = useCallback(() => {
    if (isMyLoading) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$8">
          <Text color={colors.text.dark}>載入中...</Text>
        </YStack>
      );
    }
    return (
      <YStack paddingHorizontal="$4">
        <FilterPills activeFilter={filterStatus} onFilterChange={setFilterStatus} />

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

        {!isMyLoading && inProgressTasks.length === 0 && completedTasks.length === 0 && (
          <YStack alignItems="center" paddingVertical="$8">
            <Text color="rgba(0,0,0,0.5)" fontSize={14}>
              還沒有任何實踐，快去建立第一個吧！
            </Text>
          </YStack>
        )}
      </YStack>
    );
  }, [
    isMyLoading,
    filterStatus,
    showInProgress,
    filteredInProgressTasks,
    showCompleted,
    completedTasks,
    inProgressTasks,
  ]);

  // ── Main render ──
  if (activeTab === "inspire") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {isShowcaseLoading && practices.length === 0 ? (
          <>
            {renderShowcaseHeader()}
            <YStack paddingHorizontal="$4" gap="$3">
              {[1, 2, 3].map((i) => (
                <RNView key={i} style={styles.skeleton} />
              ))}
            </YStack>
          </>
        ) : (
          <FlatList
            data={practices}
            keyExtractor={(item) => item.id}
            renderItem={renderShowcaseItem}
            ListHeaderComponent={renderShowcaseHeader}
            ListFooterComponent={renderShowcaseFooter}
            ListEmptyComponent={renderShowcaseEmpty}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 100 }}
            onEndReached={() => {
              if (hasMore && !isValidating) loadMore();
            }}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={() => mutateShowcase()}
                tintColor={colors.primary.base}
              />
            }
          />
        )}
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
            {renderMineContent()}
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
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  skeleton: {
    backgroundColor: "white",
    borderRadius: 16,
    height: 192,
    borderWidth: 1,
    borderColor: "#E8F8FF",
    opacity: 0.6,
  },
});
