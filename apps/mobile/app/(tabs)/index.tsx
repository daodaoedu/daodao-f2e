import { CheckCircle2, MessageSquare } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import {
  BrewingCard,
  DashboardHeader,
  type IShowcaseFilterState,
  ShowcaseCard,
  ShowcaseSearchBar,
  TabSwitcher,
  type TabType,
} from "@/components/home";
import { RandomPracticesSection } from "@/components/practice/shared/random-practices-section";
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
import { useMobileTranslation } from "@/i18n";

export default function HomeScreen() {
  const _router = useRouter();
  const t = useMobileTranslation("mobile.home");
  const [activeTab, setActiveTab] = useState<TabType>("inspire");

  // ── Inspire tab state ──
  const [searchValue, setSearchValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<IShowcaseFilterState>({
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

  const _handleFiltersChange = useCallback((newFilters: IShowcaseFilterState) => {
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
  const showCompleted =
    filterStatus === FilterStatus.all || filterStatus === FilterStatus.completed;

  const filterCounts = useMemo(() => {
    const counts = {
      [FilterStatus.all]: inProgressTasks.length + completedTasks.length,
      [FilterStatus.draft]: 0,
      [FilterStatus.notStarted]: 0,
      [FilterStatus.inProgress]: 0,
      [FilterStatus.completed]: completedTasks.length,
    };
    for (const t of inProgressTasks) {
      if (t.status in counts) {
        counts[t.status as keyof typeof counts]++;
      }
    }
    return counts;
  }, [inProgressTasks, completedTasks]);

  const dashboardStats = useMemo(
    () => [
      {
        label: t("stats_streak_label"),
        value: String(stats.currentStreak || 0),
        unit: t("stats_days_unit"),
        icon: (
          <CheckCircle2
            size={48}
            color={colors.text.dark}
            style={{ transform: [{ rotate: "-12deg" }] }}
          />
        ),
      },
      {
        label: t("stats_responses_label"),
        value: String(stats.totalCheckIns || 0),
        unit: t("stats_times_unit"),
        icon: (
          <MessageSquare
            size={48}
            color={colors.text.dark}
            style={{ transform: [{ rotate: "-12deg" }] }}
          />
        ),
      },
    ],
    [stats, t]
  );

  // ── Inspire tab render ──
  const renderShowcaseItem = useCallback(
    ({ item }: { item: IShowcasePractice }) =>
      item.is_brewing ? <BrewingCard practice={item} /> : <ShowcaseCard practice={item} />,
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

  // ── Main render ──
  if (activeTab === "inspire") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ShowcaseFeed
          practices={practices}
          isLoading={isShowcaseLoading}
          isValidating={isValidating}
          hasMore={hasMore}
          loadMore={loadMore}
          onRefresh={mutateShowcase}
          renderItem={renderShowcaseItem}
          renderHeader={renderShowcaseHeader}
        />
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

        {isMyLoading ? (
          <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$8">
            <Text color={colors.text.dark}>{t("loading")}</Text>
          </YStack>
        ) : (
          <YStack paddingHorizontal="$4">
            <DashboardHeader stats={dashboardStats} />
            {!hasPractices && <RandomPracticesSection compact />}
            {hasPractices && (
              <PracticeTasksSection
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                filteredInProgressTasks={filteredInProgressTasks}
                showInProgress={showInProgress}
                showCompleted={showCompleted}
                completedTasks={completedTasks}
                isEmpty={false}
                counts={filterCounts}
              />
            )}
          </YStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
});
