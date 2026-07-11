import { getUserProfileByIdentifier } from "@daodao/api";
import activeShaperJson from "@daodao/assets/images/quiz/active-shaper-1.json";
import communityConnectorJson from "@daodao/assets/images/quiz/community-connector-1.json";
import deepExplorerJson from "@daodao/assets/images/quiz/deep-explorer-1.json";
import liquidIntegratorJson from "@daodao/assets/images/quiz/liquid-integrator-1.json";
import orderBuilderJson from "@daodao/assets/images/quiz/order-builder-1.json";
import { ChevronRight, RefreshCw } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import LottieView, { type AnimationObject } from "lottie-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Pressable,
  RefreshControl,
  View as RNView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";
import { Card, Text, XStack, YStack } from "tamagui";
import {
  PracticeSection,
  PracticeTabBar,
  type PracticeTabType,
} from "@/components/practice/practice-section";
import { Button } from "@/components/ui/button";
import { UserInfoCard } from "@/components/user";
import { getQuizThemeMessage, getQuizUrl } from "@/constants/quiz-theme";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMobileTranslation } from "@/i18n";

const bannerImage = require("@/assets/images/user-mobile-banner.png");
const logoImage = require("@/assets/images/logo.png");
const BANNER_HEIGHT = 420;

// 對齊 product island-header：依測驗結果類型顯示對應島嶼動畫，無結果時預設動動島
const resultTypeToLottie: Record<string, AnimationObject> = {
  D: deepExplorerJson,
  O: orderBuilderJson,
  A: activeShaperJson,
  L: liquidIntegratorJson,
  C: communityConnectorJson,
};

export default function ProfileScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.profile");
  const homeT = useMobileTranslation("mobile.home");
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // ── 主題實踐分頁（對齊 product：rail 是捲動才出現的置頂 sticky bar）──
  const [activeTab, setActiveTab] = useState<PracticeTabType>("practices");

  // ── User data ──
  const { user, isLoading: isUserLoading, mutate: mutateUser } = useCurrentUser();

  // ── Profile 統計（追蹤數 / 連結數 / 近期實踐數 / 地點 / 標語 / 自介 / 社群）──
  // 對齊 product：這些欄位來自 profile endpoint，非 /me，故另外抓。
  // 必須用 user.id（UUID / external_id）；傳 customId 後端會拿去 parse UUID 而 500。
  const profileIdentifier = user?.id ?? null;
  const { data: profileResponse, mutate: mutateProfile } = useSWR(
    profileIdentifier ? ["/api/v1/users/profile/{identifier}", profileIdentifier] : null,
    // wrapFetch 會自動帶 Bearer token；identifier 必須是 UUID（見上方註解）
    ([, identifier]) => getUserProfileByIdentifier(identifier),
    { revalidateOnFocus: false }
  );
  const profile = profileResponse?.data;

  // ── 學習類型 ──
  const resultType = user?.latestQuizResult?.resultType?.toUpperCase() ?? null;
  const learningTypeMessage = getQuizThemeMessage(resultType);
  const isEmptyResult = !learningTypeMessage;
  const lottieSource: AnimationObject =
    (resultType ? resultTypeToLottie[resultType] : undefined) ?? activeShaperJson;

  // ── Scroll ──
  const SCROLL_THRESHOLD = 167;

  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });

  // 置頂分頁列：捲動超過門檻才滑入（對齊 product 的 sticky sub-nav）
  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [SCROLL_THRESHOLD - 20, SCROLL_THRESHOLD],
    outputRange: [-220, 0],
    extrapolate: "clamp",
  });

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
  });

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
    mutateProfile();
  }, [mutateUser, mutateProfile]);

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
        <LottieView source={lottieSource} autoPlay loop style={styles.lottie} />
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

      {/* 置頂分頁列 — 捲動超過門檻才滑入（對齊 product sticky sub-nav）*/}
      <Animated.View
        style={[
          styles.stickyTabBar,
          { paddingTop: insets.top + 8, transform: [{ translateY: tabBarTranslateY }] },
        ]}
      >
        <PracticeTabBar activeTab={activeTab} onChange={setActiveTab} />
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
            {isUserLoading ? (
              <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$8">
                <Text color={colors.text.dark}>{homeT("loading")}</Text>
              </YStack>
            ) : (
              <>
                {/* 用戶資料卡片 */}
                <UserInfoCard
                  name={profile?.name ?? user?.name ?? null}
                  customId={profile?.customId ?? user?.customId}
                  location={
                    profile?.locationNameZh ??
                    profile?.location ??
                    user?.locationNameZh ??
                    user?.location ??
                    null
                  }
                  selfIntroduction={profile?.selfIntroduction ?? user?.selfIntroduction}
                  photoURL={profile?.photoURL ?? user?.photoURL}
                  personalSlogan={profile?.personalSlogan ?? user?.personalSlogan}
                  contactList={profile?.contactList ?? user?.contactList}
                  connectionsCount={profile?.connectionsCount}
                  followersCount={profile?.followersCount}
                  hideConnectionsCount={profile?.hideConnectionsCount}
                  recentPracticeCount={profile?.recentPracticeCount}
                  editable
                  onEdit={() => router.push("/settings/public-info" as never)}
                />

                {/* 主題實踐區（含學習人物誌分頁）— 對齊 product PracticeSection */}
                {user?.id ? <PracticeSection userId={user.id} activeTab={activeTab} /> : null}
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
    ...StyleSheet.absoluteFill,
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
  stickyTabBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
