import { useRouter } from "expo-router";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { RefreshControl, View as RNView, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import {
  BANNER_CONTENT_HEIGHT,
  BrewingCard,
  HomeBanner,
  type IShowcaseFilterState,
  ShowcaseSearchBar,
  TabSwitcher,
  type TabType,
} from "@/components/home";
import { PersonaProfileMe } from "@/components/persona/persona-profile-me";
import { ResonanceCarousel } from "@/components/persona/ResonanceCarousel";
import { ActivityCard } from "@/components/showcase/ActivityCard";
import { CheckInShowcaseCard } from "@/components/showcase/CheckInShowcaseCard";
import { FeedLabel } from "@/components/showcase/FeedLabel";
import { PracticeShowcaseCard } from "@/components/showcase/PracticeShowcaseCard";
import { PracticeTasksSection } from "@/components/showcase/PracticeTasksSection";
import { RecommendationSection } from "@/components/showcase/RecommendationSection";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { type FeedItem, type IFeedParams, reorderFeedItems, useFeed } from "@/hooks/useFeed";
import { usePractices } from "@/hooks/usePractices";
import { useMobileTranslation } from "@/i18n";

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
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("inspire");

  // banner 固定在內容底下、內容捲上去把它蓋掉並淡出（完全對齊 product 的固定+淡出行為）。
  // spacer 高度 = banner 全高（含狀態列 inset），讓內容從 banner 底下開始。
  const bannerHeight = insets.top + BANNER_CONTENT_HEIGHT;
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const bannerFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, bannerHeight], [1, 0], "clamp"),
  }));
  // 切 tab 時捲動位置歸零（scrollY 為三 tab 共用），避免 banner 淡出殘留到新 tab。
  const handleTabChange = useCallback(
    (tab: TabType) => {
      scrollY.value = 0;
      setActiveTab(tab);
    },
    [scrollY]
  );

  // ── Inspire tab state ──
  const [searchValue, setSearchValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<IShowcaseFilterState>({
    tags: [],
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
  const { allTasks, isLoading: isMyLoading, mutate: mutatePractices } = usePractices();

  const hasPractices = allTasks.length > 0;

  const filterCounts = useMemo(() => {
    const counts = {
      [FilterStatus.all]: allTasks.length,
      [FilterStatus.draft]: 0,
      [FilterStatus.notStarted]: 0,
      [FilterStatus.inProgress]: 0,
      [FilterStatus.completed]: 0,
    };
    for (const task of allTasks) {
      if (task.status in counts) {
        counts[task.status as keyof typeof counts]++;
      }
    }
    return counts;
  }, [allTasks]);

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

  // 固定在內容底下的 banner（全出血），會被捲上來的內容蓋掉並隨捲動淡出。
  const renderFixedBanner = useCallback(
    () => (
      <Animated.View style={[styles.bannerFixed, bannerFadeStyle]} pointerEvents="none">
        <HomeBanner />
      </Animated.View>
    ),
    [bannerFadeStyle]
  );

  // 捲動內容最上方共用結構：透明 spacer（露出底下固定 banner）+ 不透明灰底區塊
  // （tab bar + 該 tab 的內容），捲上去時灰底會蓋住 banner。三個 tab 共用、一起捲走。
  // 灰底用 -16 margin 出血到滿版蓋住 banner，內部再用 16 padding 讓內容對齊。
  const renderScrollHeader = useCallback(
    (extra: ReactNode) => (
      <>
        <YStack height={bannerHeight} />
        <YStack style={styles.scrollTopBg} paddingHorizontal="$4" paddingTop="$3">
          <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
          {extra}
        </YStack>
      </>
    ),
    [activeTab, handleTabChange, bannerHeight]
  );

  // inspire tab 的捲動內容表頭：tab + 搜尋列 + 認識你卡。
  const renderShowcaseHeader = useCallback(
    () =>
      renderScrollHeader(
        <YStack paddingBottom="$3" gap="$3">
          <ShowcaseSearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
          />
          {/* TODO: ShowcaseFilterBar hidden for now */}
          <ResonanceCarousel />
        </YStack>
      ),
    [renderScrollHeader, searchValue, handleSearch]
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
  // 版面：容器灰底 → 固定 banner（在底下）→ 捲動內容（透明，蓋在 banner 上）。
  if (activeTab === "inspire") {
    return (
      <RNView style={styles.container}>
        {renderFixedBanner()}
        {isShowcaseLoading && orderedFeedItems.length === 0 ? (
          <Animated.ScrollView
            style={styles.flexFill}
            contentContainerStyle={styles.feedContent}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {renderShowcaseHeader()}
            <YStack gap="$3">
              {[1, 2, 3].map((i) => (
                <RNView key={i} style={styles.skeleton} />
              ))}
            </YStack>
          </Animated.ScrollView>
        ) : (
          <Animated.FlatList<FeedItem>
            style={styles.flexFill}
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
        )}
      </RNView>
    );
  }

  if (activeTab === "persona") {
    return (
      <RNView style={styles.container}>
        {renderFixedBanner()}
        <Animated.ScrollView
          style={styles.flexFill}
          contentContainerStyle={styles.tabScroll}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {renderScrollHeader(<PersonaProfileMe />)}
        </Animated.ScrollView>
      </RNView>
    );
  }

  // Mine tab
  return (
    <RNView style={styles.container}>
      {renderFixedBanner()}
      <Animated.ScrollView
        style={styles.flexFill}
        contentContainerStyle={styles.tabScroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => mutatePractices()}
            tintColor={colors.primary.base}
          />
        }
      >
        {renderScrollHeader(
          isMyLoading ? (
            <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
              <Text color={colors.text.dark}>{t("loading")}</Text>
            </YStack>
          ) : (
            <YStack>
              {hasPractices && (
                <PracticeTasksSection
                  tasks={allTasks}
                  filterStatus={filterStatus}
                  onFilterChange={setFilterStatus}
                  counts={filterCounts}
                />
              )}
              {/* 對齊 product：探索相關主題（AI 推薦），永遠顯示於實踐下方 */}
              <RecommendationSection />
            </YStack>
          )
        )}
      </Animated.ScrollView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  // 固定在內容底下的 banner（rendered 在捲動層之前 → 位於底下）
  bannerFixed: { position: "absolute", top: 0, left: 0, right: 0 },
  flexFill: { flex: 1, backgroundColor: "transparent" },
  // 捲動內容的灰底區塊：-16 出血到滿版蓋住 banner
  scrollTopBg: { marginHorizontal: -16, backgroundColor: "#F7F7F7" },
  feedContent: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  tabScroll: { paddingHorizontal: 16, paddingBottom: 100 },
  skeleton: {
    backgroundColor: "white",
    borderRadius: 16,
    height: 192,
    borderWidth: 1,
    borderColor: "#E8F8FF",
    opacity: 0.6,
  },
});
