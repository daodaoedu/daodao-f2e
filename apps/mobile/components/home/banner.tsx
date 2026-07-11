import { getLatestQuizResult } from "@daodao/api";
import { MobileBannerSvg } from "@daodao/assets";
import { resultDetailMap } from "@daodao/features-quiz/result-detail-map";
import LottieView, { type AnimationObject } from "lottie-react-native";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Text, View } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

// 島島 logo（product 首頁左上角，40x40，隨 banner 一起淡出）— 與 product sidebar/mobile 同資產
const LOGO = require("@daodao/assets/images/brand/favicon256.png");
// 頁面底色（用來在 banner 底部畫波浪、切出 product 的 mask-intersect 波浪底邊）
const PAGE_BG = "#F7F7F7";
// 波浪高度（banner 底部覆蓋這麼高的頁色波浪）
const WAVE_HEIGHT = 22;

// quiz 類型 → Lottie JSON（-2 版，與 product 一致）
const LOTTIE_BY_TYPE: Record<string, AnimationObject> = {
  A: require("@daodao/assets/images/quiz/active-shaper-2.json"),
  O: require("@daodao/assets/images/quiz/order-builder-2.json"),
  D: require("@daodao/assets/images/quiz/deep-explorer-2.json"),
  L: require("@daodao/assets/images/quiz/liquid-integrator-2.json"),
  C: require("@daodao/assets/images/quiz/community-connector-2.json"),
};

// banner 狀態列以下的可視高度（對齊 product `aspect-195/73` 的寬版比例）
export const BANNER_CONTENT_HEIGHT = Math.round((Dimensions.get("window").width * 73) / 195);

/**
 * 頂部吉祥物 banner。三個 tab 共用，放在各 tab 捲動內容的最上面（一般捲動元素，
 * 會隨內容一起上捲離開）。全出血蓋到狀態列（teal 延伸到螢幕頂端），slogan/吉祥物
 * 內容壓在安全區 inset 以下。
 */
export function HomeBanner() {
  const t = useMobileTranslation("app_product");
  const insets = useSafeAreaInsets();
  const [resultType, setResultType] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await getLatestQuizResult();
      if (res.error) {
        // 404 = 使用者尚未完成測驗，屬正常空狀態：靜默回退到預設 slogan。
        // 其他非預期錯誤用 console.log 記錄即可——console.error/warn 在 dev 會觸發
        // LogBox 紅色通知，把正常的空狀態誤報成錯誤。
        if (res.response?.status !== 404) {
          console.log("Failed to fetch quiz result:", res.error);
        }
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
  const totalHeight = insets.top + BANNER_CONTENT_HEIGHT;

  return (
    <View style={[styles.wrap, { height: totalHeight }]} pointerEvents="none">
      {/* 背景 SVG 全出血。用 slice + 上緣對齊（xMidYMin）：顯示漸層最濃的 teal 上緣，
          而非褪色的中間帶（原本 xMidYMid 造成 banner 偏淡、波浪沒對比）。*/}
      <MobileBannerSvg preserveAspectRatio="xMidYMin slice" style={StyleSheet.absoluteFill} />

      {/* 狀態列以下的內容區：slogan 對話框置中，吉祥物靠右垂直置中 */}
      {/* 島島 logo：左上角（對齊 product fixed top-5 left-5），壓在狀態列 inset 以下 */}
      <Image source={LOGO} style={[styles.logo, { top: insets.top + 4 }]} resizeMode="contain" />

      <View style={[styles.content, { top: insets.top, height: BANNER_CONTENT_HEIGHT }]}>
        <View style={styles.bubble}>
          <Text fontSize={14} color={colors.text.dark} textAlign="center">
            {slogan}
          </Text>
        </View>
        <View style={styles.lottie}>
          <LottieView source={lottie} autoPlay loop style={styles.lottieInner} />
        </View>
      </View>

      {/* 波浪底邊：用頁色填的波浪蓋在 banner 底部（等同 product 的 mask-intersect 波浪），
          中央凹得比兩側深（對齊遮罩 path 中央 y=116 < 兩側 y=138）。*/}
      <Svg
        width="100%"
        height={WAVE_HEIGHT}
        viewBox="0 0 390 22"
        preserveAspectRatio="none"
        style={styles.wave}
      >
        <Path
          d="M0 8 C 45.9 2 138.7 0 195 0 C 251.3 0 344.1 2 390 8 L390 22 L0 22 Z"
          fill={PAGE_BG}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    maxWidth: "72%",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  lottie: {
    position: "absolute",
    right: 8,
    width: 84,
    height: 84,
    transform: [{ rotate: "3deg" }],
  },
  lottieInner: { width: "100%", height: "100%" },
  wave: { position: "absolute", left: 0, right: 0, bottom: 0 },
  logo: { position: "absolute", left: 16, width: 40, height: 40, borderRadius: 10 },
});
