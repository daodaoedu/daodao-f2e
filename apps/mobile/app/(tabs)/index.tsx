import { CheckCircle2, MessageSquare } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Dimensions, RefreshControl, View as RNView, ScrollView, StyleSheet } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import {
  BrewingCard,
  DashboardHeader,
  HomeBanner,
  type IShowcaseFilterState,
  ShowcaseSearchBar,
  TabSwitcher,
  type TabType,
} from "@/components/home";
import { PersonaProfileMe } from "@/components/persona/persona-profile-me";
import { ResonanceCarousel } from "@/components/persona/ResonanceCarousel";
import { RandomPracticesSection } from "@/components/practice/shared/random-practices-section";
import { ActivityCard } from "@/components/showcase/ActivityCard";
import { CheckInShowcaseCard } from "@/components/showcase/CheckInShowcaseCard";
import { FeedLabel } from "@/components/showcase/FeedLabel";
import { PracticeShowcaseCard } from "@/components/showcase/PracticeShowcaseCard";
import { PracticeTasksSection } from "@/components/showcase/PracticeTasksSection";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { type FeedItem, type IFeedParams, reorderFeedItems, useFeed } from "@/hooks/useFeed";
import { usePractices } from "@/hooks/usePractices";
import { useMobileTranslation } from "@/i18n";

// banner 比例固定 195:73（對齊 @daodao/assets 的 mobile-banner SVG）
const BANNER_HEIGHT = Math.round((Dimensions.get("window").width * 73) / 195);

function feedItemKey(item: FeedItem, index: number): string {
  if (item.type === "activity") {
    return item.event_id
      ? `activity-${item.event_type}-${item.event_id}`
      : `activity-${item.activity_type}-${index}`;
  }
  if (item.type === "checkin") {
    return `checkin-${item.data.id}-${item.feed_reason}`;
  }
  return `practice-${item.data.id}-${item.feed_reason}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.home");
  const [activeTab, setActiveTab] = useState<TabType>("inspire");

  // ── Inspire tab state ──
  const [searchValue, setSearchValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<IShowcaseFilterState>({
    tags: [],
  });

  // banner 滾動漸淡（只在 inspire tab 使用）
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const feedParams: IFeedParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
    }),
    [keyword, filters]
  );

  const { user: currentUser } = useCurrentUser();
  const {
    feedItems,
    isLoading: isShowcaseLoading,
    hasMore,
    loadMore,
    isValidating,
    mutate: mutateShowcase,
  } = useFeed(feedParams);

  const orderedFeedItems = useMemo(
    () => reorderFeedItems(feedItems, currentUser?.id),
    [feedItems, currentUser?.id]
  );

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
  const renderFeedItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      if (item.type === "activity") {
        const canOpenActivity = !!item.practice_id && !!item.checkin_id;
        return (
          <ActivityCard
            eventText={item.event_text}
            label={item.label}
            onPress={
              canOpenActivity
                ? () => router.push(`/practices/${item.practice_id}/check-ins/${item.checkin_id}`)
                : undefined
            }
          />
        );
      }

      const isNewRelease = item.feed_reason === "new_release";
      const prevItem = index > 0 ? orderedFeedItems[index - 1] : undefined;
      const prevFeedReason =
        prevItem && prevItem.type !== "activity" ? prevItem.feed_reason : undefined;
      const showFeedLabel = !isNewRelease || prevFeedReason !== "new_release";

      if (item.type === "checkin") {
        const checkin = item.data;
        const latestActorName = checkin.reactions?.find((r) => r.latestActorName)?.latestActorName;
        return (
          <YStack>
            {showFeedLabel && (
              <FeedLabel
                feedReason={item.feed_reason}
                userName={checkin.user?.name}
                practiceTitle={checkin.practice?.title}
                latestActorName={latestActorName}
              />
            )}
            <CheckInShowcaseCard {...checkin} />
          </YStack>
        );
      }

      const practice = item.data;
      const latestActorName = practice.reactions?.find((r) => r.latestActorName)?.latestActorName;
      return (
        <YStack>
          {showFeedLabel && (
            <FeedLabel
              feedReason={item.feed_reason}
              userName={practice.user?.name}
              latestActorName={latestActorName}
            />
          )}
          {practice.is_brewing ? (
            <BrewingCard practice={practice} />
          ) : (
            <PracticeShowcaseCard
              practice={practice}
              onReactionUpdated={() => {
                mutateShowcase();
              }}
            />
          )}
        </YStack>
      );
    },
    [orderedFeedItems, mutateShowcase, router]
  );

  const renderShowcaseHeader = useCallback(
    () => (
      <>
        {/* banner overlay 疊在最上層，這裡預留等高的空間避免 tab/search 被蓋住 */}
        <YStack height={BANNER_HEIGHT} />
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
          <ResonanceCarousel />
        </YStack>
      </>
    ),
    [activeTab, searchValue, handleSearch]
  );

  const renderFeedFooter = useCallback(
    () =>
      isValidating ? (
        <Text textAlign="center" paddingVertical="$4" color="rgba(0,0,0,0.5)" fontSize={14}>
          {t("loading")}
        </Text>
      ) : null,
    [isValidating, t]
  );

  const renderFeedEmpty = useCallback(
    () =>
      !isShowcaseLoading ? (
        <YStack alignItems="center" paddingVertical="$8">
          <Text color="rgba(0,0,0,0.5)" fontSize={14}>
            {t("empty_showcase")}
          </Text>
        </YStack>
      ) : null,
    [isShowcaseLoading, t]
  );

  // ── Main render ──
  if (activeTab === "inspire") {
    if (isShowcaseLoading && orderedFeedItems.length === 0) {
      // 骨架載入畫面也疊上 banner overlay：renderShowcaseHeader 已預留等高間距，
      // 避免載入完成切換到 FlatList 時 banner 突然出現造成版面跳動。
      return (
        <SafeAreaView style={styles.container} edges={["top"]}>
          <RNView style={styles.bannerOverlay} pointerEvents="box-none">
            <HomeBanner scrollY={scrollY} />
          </RNView>
          {renderShowcaseHeader()}
          <YStack paddingHorizontal="$4" gap="$3">
            {[1, 2, 3].map((i) => (
              <RNView key={i} style={styles.skeleton} />
            ))}
          </YStack>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <RNView style={styles.bannerOverlay} pointerEvents="box-none">
          <HomeBanner scrollY={scrollY} />
        </RNView>
        <Animated.FlatList<FeedItem>
          data={orderedFeedItems}
          keyExtractor={feedItemKey}
          renderItem={renderFeedItem}
          ListHeaderComponent={renderShowcaseHeader}
          ListFooterComponent={renderFeedFooter}
          ListEmptyComponent={renderFeedEmpty}
          contentContainerStyle={styles.feedContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onEndReached={() => {
            if (hasMore && !isValidating) loadMore();
          }}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isValidating}
              onRefresh={() => mutateShowcase()}
              tintColor={colors.primary.base}
            />
          }
        />
      </SafeAreaView>
    );
  }

  if (activeTab === "persona") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <YStack paddingHorizontal="$4" paddingTop="$4">
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
          </YStack>
          <YStack paddingHorizontal="$4">
            <PersonaProfileMe />
          </YStack>
        </ScrollView>
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
  feedContent: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  skeleton: {
    backgroundColor: "white",
    borderRadius: 16,
    height: 192,
    borderWidth: 1,
    borderColor: "#E8F8FF",
    opacity: 0.6,
  },
  bannerOverlay: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 },
});
