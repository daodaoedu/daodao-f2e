import {
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Sparkles,
} from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  View as RNView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import activeShaper1Json from "@/assets/animations/active-shaper-1.json";
import { CompletedCard, DashboardHeader, FilterPills, InProgressCard } from "@/components/home";
import { RandomPracticesSection } from "@/components/practice/shared/random-practices-section";
import { UserInfoCard } from "@/components/user";
import { getQuizThemeMessage, getQuizUrl } from "@/constants/quiz-theme";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePractices } from "@/hooks/usePractices";
import { useMobileTranslation } from "@/i18n";

const bannerImage = require("@/assets/images/user-mobile-banner.png");
const logoImage = require("@/assets/images/logo.png");
const BANNER_HEIGHT = 420;

export default function ProfileScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.profile");
  const homeT = useMobileTranslation("mobile.home");
  const personaT = useMobileTranslation("persona");
  const { width: screenWidth } = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;

  // ── User data ──
  const { user, isLoading: isUserLoading, mutate: mutateUser } = useCurrentUser();

  // ── 學習類型 ──
  const resultType = user?.latestQuizResult?.resultType?.toUpperCase() ?? null;
  const learningTypeMessage = getQuizThemeMessage(resultType);
  const isEmptyResult = !learningTypeMessage;

  // ── Scroll ──
  const SCROLL_THRESHOLD = 167;

  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
  });

  // ── Practices ──
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

  const dashboardStats = useMemo(
    () => [
      {
        label: homeT("stats_streak_label"),
        value: String(stats.currentStreak || 0),
        unit: homeT("stats_days_unit"),
        icon: (
          <CheckCircle2
            size={48}
            color={colors.text.dark}
            style={{ transform: [{ rotate: "-12deg" }] }}
          />
        ),
      },
      {
        label: homeT("stats_responses_label"),
        value: String(stats.totalCheckIns || 0),
        unit: homeT("stats_times_unit"),
        icon: (
          <MessageSquare
            size={48}
            color={colors.text.dark}
            style={{ transform: [{ rotate: "-12deg" }] }}
          />
        ),
      },
    ],
    [stats, homeT]
  );

  // ── Handlers ──
  // 測驗填答流程僅在 apps/website 實作，App 內導去該網址進行測驗
  const handleOpenQuiz = useCallback(async () => {
    const url = getQuizUrl();
    try {
      // https 是所有裝置皆支援的標準協議，canOpenURL 在部分裝置設定下對 https 可能誤判為 false，故直接開啟並用 try/catch 處理例外
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open quiz URL:", error);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    mutateUser();
    mutatePractices();
  }, [mutateUser, mutatePractices]);

  const handleOpenFootprints = useCallback(() => {
    router.push("/me/footprints" as never);
  }, [router]);

  return (
    <RNView style={styles.container}>
      {/* 固定背景層 */}
      <RNView style={styles.fixedBackground} />

      {/* 固定 Banner */}
      <Animated.View
        style={[styles.fixedBannerContainer, { opacity: bannerOpacity, width: screenWidth }]}
      >
        <Animated.Image
          source={bannerImage}
          style={[styles.fixedBanner, { width: screenWidth }]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* 固定頂部導航 */}
      <SafeAreaView style={styles.fixedHeader} edges={["top"]}>
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$3"
          justifyContent="space-between"
          alignItems="center"
        >
          <Animated.Image source={logoImage} style={styles.logo} />
          <Text fontSize={18} fontWeight="500" color={colors.text.dark}>
            {t("title")}
          </Text>
          <RNView style={{ width: 24 }} />
        </XStack>
      </SafeAreaView>

      {/* 固定 Lottie 動畫 — 隨滾動變淡 */}
      <Animated.View
        style={[styles.fixedLottie, { opacity: bannerOpacity, left: screenWidth / 2 - 75 }]}
      >
        <LottieView source={activeShaper1Json} autoPlay loop style={styles.lottie} />
      </Animated.View>

      {/* 固定學習類型卡片 — 隨滾動變淡 */}
      <Animated.View style={[styles.fixedLearningCard, { opacity: bannerOpacity }]}>
        <Card
          backgroundColor="rgba(255, 255, 255, 0.7)"
          borderRadius={20}
          padding="$4"
          borderWidth={1}
          borderColor={colors.border.lightCyan}
        >
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
            <Text fontSize={14} fontWeight="500" color={colors.logo.cyan}>
              {t("learning_type")}
            </Text>
            {!isEmptyResult && (
              <Pressable onPress={handleOpenQuiz}>
                <XStack alignItems="center" gap="$1">
                  <RefreshCw size={16} color={colors.text.muted} />
                  <Text fontSize={12} color={colors.text.dark}>
                    {t("retake_quiz")}
                  </Text>
                </XStack>
              </Pressable>
            )}
          </XStack>
          <Text fontSize={16} fontWeight="500" color={colors.text.dark} marginBottom="$3">
            {isEmptyResult
              ? t("quiz_prompt")
              : t("learning_type_result", { result: learningTypeMessage })}
          </Text>
          <Button
            backgroundColor={colors.logo.orange}
            borderRadius="$md"
            height={44}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleOpenQuiz}
          >
            <XStack alignItems="center" gap="$1">
              <Text color={colors.text.light} fontWeight="500">
                {isEmptyResult ? t("start_quiz") : t("view_details")}
              </Text>
              <ChevronRight size={16} color={colors.text.light} />
            </XStack>
          </Button>
        </Card>
      </Animated.View>

      {/* 主內容層 */}
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={colors.primary.base}
            />
          }
        >
          {/* 頂部佔位區域 */}
          <RNView style={styles.headerContainer} />

          {/* 主要內容區 */}
          <YStack paddingHorizontal="$4" paddingBottom={120} minHeight={300}>
            {isUserLoading || isMyLoading ? (
              <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$8">
                <Text color={colors.text.dark}>{homeT("loading")}</Text>
              </YStack>
            ) : (
              <>
                {/* 用戶資料卡片 */}
                <UserInfoCard
                  name={user?.name ?? null}
                  location={user?.locationNameZh ?? user?.location ?? null}
                  selfIntroduction={user?.selfIntroduction}
                  photoURL={user?.photoURL}
                  personalSlogan={user?.personalSlogan}
                  contactList={user?.contactList}
                />

                {/* Dashboard 統計 */}
                <DashboardHeader stats={dashboardStats} />

                <Button
                  marginBottom="$4"
                  backgroundColor={colors.background.light}
                  borderWidth={1}
                  borderColor={colors.border.light}
                  onPress={handleOpenFootprints}
                >
                  <XStack alignItems="center" gap="$2">
                    <MessageSquare size={18} color={colors.logo.cyan} />
                    <Text color={colors.text.dark}>{t("view_footprints")}</Text>
                    <ChevronRight size={16} color={colors.text.muted} />
                  </XStack>
                </Button>

                <Button
                  marginBottom="$4"
                  backgroundColor={colors.background.light}
                  borderWidth={1}
                  borderColor={colors.border.light}
                  onPress={() => router.push("/persona" as never)}
                >
                  <XStack alignItems="center" gap="$2">
                    <Sparkles size={18} color={colors.logo.cyan} />
                    <Text color={colors.text.dark}>{personaT("tabLabelShort")}</Text>
                    <ChevronRight size={16} color={colors.text.muted} />
                  </XStack>
                </Button>

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
                        <Text fontSize={18} fontWeight="500" color={colors.text.dark}>
                          {homeT("completed")}
                        </Text>
                        {completedTasks.map((task) => (
                          <CompletedCard key={task.id} task={task} />
                        ))}
                      </YStack>
                    )}
                  </>
                )}
              </>
            )}
          </YStack>
        </Animated.ScrollView>
      </SafeAreaView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B8E8FD",
  },
  fixedBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#B8E8FD",
    zIndex: 0,
  },
  fixedBannerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: BANNER_HEIGHT,
    zIndex: 1,
  },
  fixedBanner: {
    height: BANNER_HEIGHT,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "transparent",
  },
  fixedLottie: {
    position: "absolute",
    top: 100,
    width: 150,
    height: 150,
    zIndex: 2,
  },
  fixedLearningCard: {
    position: "absolute",
    top: 260,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  safeArea: {
    flex: 1,
    zIndex: 3,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    height: BANNER_HEIGHT - 30,
    backgroundColor: "transparent",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  lottie: {
    width: 150,
    height: 150,
  },
});
