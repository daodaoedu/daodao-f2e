import { getLatestQuizResult } from "@daodao/api";
import { MobileBannerSvg } from "@daodao/assets";
import { resultDetailMap } from "@daodao/features-quiz/result-detail-map";
import LottieView, { type AnimationObject } from "lottie-react-native";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Text, View } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

// quiz 類型 → Lottie JSON（-2 版，與 product 一致）
const LOTTIE_BY_TYPE: Record<string, AnimationObject> = {
  A: require("@daodao/assets/images/quiz/active-shaper-2.json"),
  O: require("@daodao/assets/images/quiz/order-builder-2.json"),
  D: require("@daodao/assets/images/quiz/deep-explorer-2.json"),
  L: require("@daodao/assets/images/quiz/liquid-integrator-2.json"),
  C: require("@daodao/assets/images/quiz/community-connector-2.json"),
};

const FADE_THRESHOLD = 167;
// banner SVG 視覺比例固定 195:73（對齊 product `aspect-195/73`）
const BANNER_ASPECT_RATIO = 73 / 195;

export function HomeBanner({ scrollY }: { scrollY: SharedValue<number> }) {
  const t = useMobileTranslation("app_product");
  const [resultType, setResultType] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await getLatestQuizResult();
      if (res.error) {
        console.error("Failed to fetch quiz result:", res.error);
        return;
      }
      const type = res.data?.data?.resultType?.toUpperCase();
      if (alive && type) setResultType(type);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const slogan = useMemo(() => {
    const fallback = t("banner_default_slogan");
    return resultType ? (resultDetailMap.get(resultType)?.slogan ?? fallback) : fallback;
  }, [resultType, t]);

  const lottie = LOTTIE_BY_TYPE[resultType ?? "A"] ?? LOTTIE_BY_TYPE.A;

  const bannerHeight = Math.round(Dimensions.get("window").width * BANNER_ASPECT_RATIO);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, FADE_THRESHOLD], [1, 0.3], "clamp"),
  }));

  return (
    <Animated.View
      style={[styles.wrap, { height: bannerHeight }, fadeStyle]}
      pointerEvents="none"
    >
      {/* 背景 SVG 沒有內建 width/height 屬性，只設 width 無法決定尺寸（react-native-svg
          會判斷 width && height 同時存在才套用尺寸樣式），故改用 absoluteFillObject 撐滿容器，
          並用 preserveAspectRatio="none" 讓圖形填滿寬版banner（原生 viewBox 390x420 比例與
          195:73 的展示比例差距很大，用預設 meet 會在左右留白）。*/}
      <MobileBannerSvg preserveAspectRatio="none" style={StyleSheet.absoluteFillObject} />
      <View style={styles.bubble}>
        <Text fontSize={14} color={colors.text.dark} textAlign="center">
          {slogan}
        </Text>
        <View style={styles.lottie}>
          <LottieView source={lottie} autoPlay loop style={styles.lottieInner} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  bubble: {
    position: "absolute",
    alignSelf: "center",
    // product: bottom-[70%] -translate-y-full（bubble 貼齊 banner 上方 30% 處往上展開）。
    // RN transform 不支援百分比，故直接用换算後的 top 定位；bubble 實際高度依文字換行而
    // 略有差異，此值為初值，需在模擬器對照 product 微調。
    top: "8%",
    maxWidth: "80%",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  lottie: {
    position: "absolute",
    left: "100%",
    bottom: -32,
    width: 96,
    height: 96,
    transform: [{ rotate: "3deg" }],
  },
  lottieInner: { width: "100%", height: "100%" },
});
