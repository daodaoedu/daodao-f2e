import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View as RNView } from "react-native";
import { CheckCircle2, MessageSquare } from "@tamagui/lucide-icons";
import { Text, YStack, ScrollView } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/generated/design-tokens";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { usePractices } from "@/hooks/usePractices";
import { useShowcaseFeed, type IShowcaseFeedParams, type IShowcasePractice } from "@/hooks/useShowcaseFeed";
import {
  TabSwitcher,
  type TabType,
  ShowcaseSearchBar,
  type ShowcaseFilterState,
  ShowcaseCard,
  BrewingCard,
  DashboardHeader,
  FilterPills,
  InProgressCard,
  CompletedCard,
} from "@/components/home";
import { RandomPracticesSection } from "@/components/practice/shared/random-practices-section";

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("inspire");

  // ── Inspire tab state ──
  const [searchValue, setSearchValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<ShowcaseFilterState>({
    tags: [],
  });

  const feedParams: IShowcaseFeedParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      duration_min: filters.durationMin,
      duration_max: filters.durationMax,
      status: filters.status,
      sort_by: "newest_updated",
    }),
    [keyword, filters]
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

  const handleFiltersChange = useCallback((newFilters: ShowcaseFilterState) => {
    setFilters(newFilters);
  }, []);

  // ── Mine tab state ──
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>(FilterStatus.all);
  const {
    stats,
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

  const hasPractices = inProgressTasks.length > 0 || completedTasks.length > 0;
  const showInProgress = filterStatus !== FilterStatus.completed;
  const showCompleted = filterStatus === FilterStatus.all || filterStatus === FilterStatus.completed;

  const dashboardStats = useMemo(
    () => [
      {
        label: "連續登入",
        value: String(stats.currentStreak || 0),
        unit: "天",
        icon: <CheckCircle2 size={48} color={colors.text.dark} style={{ transform: [{ rotate: "-12deg" }] }} />,
      },
      {
        label: "獲得迴響",
        value: String(stats.totalCheckIns || 0),
        unit: "次",
        icon: <MessageSquare size={48} color={colors.text.dark} style={{ transform: [{ rotate: "-12deg" }] }} />,
      },
    ],
    [stats]
  );

  // ── Inspire tab render ──
  const renderShowcaseItem = useCallback(
    ({ item }: { item: IShowcasePractice }) =>
      item.is_brewing ? (
        <BrewingCard practice={item} />
      ) : (
        <ShowcaseCard practice={item} />
      ),
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
        {/* TODO: ShowcaseFilterBar hidden for now */}
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
          <Text color="rgba(0,0,0,0.5)" fontSize={14}>沒有找到相關實踐</Text>
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
        <DashboardHeader stats={dashboardStats} />

        {!hasPractices && <RandomPracticesSection compact />}

        {hasPractices && (
          <>
            <FilterPills activeFilter={filterStatus} onFilterChange={setFilterStatus} />

            {/* In-progress cards — horizontal scroll */}
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

            {/* Completed cards — vertical list */}
            {showCompleted && completedTasks.length > 0 && (
              <YStack gap="$3" marginBottom="$4">
                <Text fontSize={18} fontWeight="500" color={colors.text.dark}>已完成</Text>
                {completedTasks.map((task) => (
                  <CompletedCard key={task.id} task={task} />
                ))}
              </YStack>
            )}
          </>
        )}
      </YStack>
    );
  }, [
    isMyLoading, dashboardStats, hasPractices, filterStatus,
    showInProgress, filteredInProgressTasks, showCompleted, completedTasks,
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

  // Mine tab — use ScrollView since content is not a homogeneous list
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => mutatePractices()}
            tintColor={colors.primary.base}
          />
        }
      >
        <YStack paddingHorizontal="$4" paddingTop="$4">
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        </YStack>
        {renderMineContent()}
      </ScrollView>
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
