import LottieView from "lottie-react-native";
import { Dimensions, Image, View as RNView, StyleSheet } from "react-native";
import Svg, { ClipPath, Defs, G, Path, RadialGradient, Stop } from "react-native-svg";
import { Text, XStack } from "tamagui";
import activeShaper2Json from "@/assets/animations/active-shaper-2.json";

const { width: screenWidth } = Dimensions.get("window");
// Banner 高度 - 調整為更短
const BANNER_HEIGHT = Math.round(screenWidth / (195 / 60));

// Logo 圖片
const logoImage = require("@/assets/images/logo.png");

export function HomeBanner() {
  // 根據 Product mobile-banner.svg (390x420) 的比例計算位置
  const scale = screenWidth / 390;

  return (
    <RNView style={[styles.container, { height: BANNER_HEIGHT + 30 }]}>
      {/* Background SVG - 模擬 Product 的 mobile-banner.svg */}
      <Svg
        width={screenWidth}
        height={BANNER_HEIGHT + 30}
        viewBox={`0 0 ${screenWidth} ${BANNER_HEIGHT + 30}`}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="bannerGradient" cx="50%" cy="0%" rx="100%" ry="100%">
            <Stop offset="0" stopColor="#5FDAD5" />
            <Stop offset="1" stopColor="#E9FEFF" />
          </RadialGradient>
          {/* ClipPath for curved bottom edge - 完全按照 Product mask 比例 */}
          {/* Product path: M195 0 C251.325 0 344.09 6.33 390 22 ... C45.91 6.33 138.675 0 195 0 */}
          <ClipPath id="bannerClip">
            <Path
              d={`M0 0 H${screenWidth} V${BANNER_HEIGHT + 22} L${screenWidth} ${BANNER_HEIGHT + 22} C${screenWidth * 0.882} ${BANNER_HEIGHT + 6} ${screenWidth * 0.644} ${BANNER_HEIGHT} ${screenWidth * 0.5} ${BANNER_HEIGHT} C${screenWidth * 0.356} ${BANNER_HEIGHT} ${screenWidth * 0.118} ${BANNER_HEIGHT + 6} 0 ${BANNER_HEIGHT + 22} Z`}
            />
          </ClipPath>
        </Defs>

        {/* Background with curved bottom and decorations */}
        <G clipPath="url(#bannerClip)">
          {/* Background gradient */}
          <Path
            d={`M0 0 H${screenWidth} V${BANNER_HEIGHT + 30} H0 Z`}
            fill="url(#bannerGradient)"
          />

          {/* Yellow semi-circle decoration (left side) */}
          <Path
            opacity={0.4}
            d={`M${20 * scale} ${105 * scale}C${-4 * scale} ${105 * scale} ${-45 * scale} ${118 * scale} ${-60 * scale} ${152 * scale}C${-61 * scale} ${154 * scale} ${-59 * scale} ${156 * scale} ${-57 * scale} ${156 * scale}H${97 * scale}C${99 * scale} ${156 * scale} ${101 * scale} ${154 * scale} ${100 * scale} ${152 * scale}C${85 * scale} ${118 * scale} ${44 * scale} ${105 * scale} ${20 * scale} ${105 * scale}Z`}
            fill="#F9E41C"
          />

          {/* White star decoration */}
          <Path
            opacity={0.7}
            d={`M${59.5 * scale} ${103 * scale}L${67 * scale} ${92 * scale}L${66 * scale} ${105 * scale}L${79 * scale} ${101 * scale}L${71 * scale} ${111 * scale}L${83 * scale} ${115 * scale}L${71 * scale} ${118 * scale}L${79 * scale} ${128 * scale}L${66 * scale} ${124 * scale}L${67 * scale} ${137 * scale}L${59.5 * scale} ${126 * scale}L${52 * scale} ${137 * scale}L${53 * scale} ${124 * scale}L${40 * scale} ${128 * scale}L${48 * scale} ${118 * scale}L${36 * scale} ${115 * scale}L${48 * scale} ${111 * scale}L${40 * scale} ${101 * scale}L${53 * scale} ${105 * scale}L${52 * scale} ${92 * scale}L${59.5 * scale} ${103 * scale}Z`}
            fill="white"
          />

          {/* Teal quarter circle (right side) */}
          <Path
            opacity={0.4}
            d={`M${336 * scale} ${54 * scale}C${336 * scale} ${84 * scale} ${360 * scale} ${108 * scale} ${390 * scale} ${108 * scale}V0C${360 * scale} 0 ${336 * scale} ${24 * scale} ${336 * scale} ${54 * scale}Z`}
            fill="#16B9B3"
          />

          {/* White arc (right side) */}
          <Path
            opacity={0.5}
            d={`M${282 * scale} ${54 * scale}C${282 * scale} ${84 * scale} ${306 * scale} ${108 * scale} ${336 * scale} ${108 * scale}V0C${306 * scale} 0 ${282 * scale} ${24 * scale} ${282 * scale} ${54 * scale}Z`}
            fill="white"
          />
        </G>
      </Svg>

      {/* Logo - 左上角 */}
      <RNView style={styles.logoContainer}>
        <Image source={logoImage} style={styles.logo} />
      </RNView>

      {/* Content - Product: top-[26px], 水平居中 */}
      <RNView style={styles.contentContainer}>
        {/* Title - Product: text-[1.125rem] = 18px */}
        <Text fontSize={18} fontWeight="500" color="#333333">
          我的小島
        </Text>

        {/* Subtitle bubble */}
        <XStack
          backgroundColor="rgba(255, 255, 255, 0.7)"
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderRadius={9999}
          borderWidth={1}
          borderColor="white"
          marginTop={8}
        >
          <Text fontSize={14} color="#333333">
            先做再說，做中學最快！
          </Text>
        </XStack>
      </RNView>

      {/* Octopus animation - 靠右貼 */}
      <RNView style={styles.octopusContainer}>
        <LottieView source={activeShaper2Json} autoPlay loop style={styles.lottie} />
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "visible",
  },
  logoContainer: {
    position: "absolute",
    top: 16,
    left: 20,
    zIndex: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  contentContainer: {
    position: "absolute",
    top: 26,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  octopusContainer: {
    position: "absolute",
    right: 0,
    top: 35,
  },
  lottie: {
    width: 96,
    height: 96,
    transform: [{ rotate: "3deg" }],
  },
});
