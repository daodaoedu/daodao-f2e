import { createAnimations } from "@tamagui/animations-react-native";
import { tokens as defaultTokens } from "@tamagui/config/v3";
import { shorthands } from "@tamagui/shorthands";
import { createFont, createTamagui, createTokens } from "tamagui";
// 使用腳本生成的 Mobile 版本 design tokens
import { colors, radius, spacing, typography } from "@/generated/design-tokens";

// 字體配置
const headingFont = createFont({
  family: "Inter",
  size: {
    1: typography.fontSizes.xs,
    2: typography.fontSizes.sm,
    3: typography.fontSizes.base,
    4: typography.fontSizes.lg,
    5: typography.fontSizes.xl,
    6: typography.fontSizes["2xl"],
    7: typography.fontSizes["3xl"],
    8: typography.fontSizes["4xl"],
  },
  weight: {
    4: typography.fontWeights.normal,
    6: typography.fontWeights.semibold,
    7: typography.fontWeights.bold,
  },
  // face 映射確保原生平台正確渲染不同字重
  face: {
    400: { normal: "Inter_400" },
    600: { normal: "Inter_600" },
    700: { normal: "Inter_700" },
  },
});

const bodyFont = createFont({
  family: "Inter",
  size: {
    1: typography.fontSizes.xs,
    2: typography.fontSizes.sm,
    3: typography.fontSizes.base,
    4: typography.fontSizes.lg,
  },
  weight: {
    4: typography.fontWeights.normal,
    5: typography.fontWeights.medium,
    6: typography.fontWeights.semibold,
  },
  face: {
    400: { normal: "Inter_400" },
    500: { normal: "Inter_500" },
    600: { normal: "Inter_600" },
  },
});

// Tokens 配置
const tokens = createTokens({
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    // Base palettes
    primaryPalest: colors.primary.palest,
    primaryPale: colors.primary.pale,
    primaryLightest: colors.primary.lightest,
    primaryLighter: colors.primary.lighter,
    primaryBase: colors.primary.base,
    primaryDarker: colors.primary.darker,
    grayDark: colors.gray.dark,
    grayMid: colors.gray.mid,
    grayLight: colors.gray.light,
    grayVeryLight: colors.gray.veryLight,
    grayWhite: colors.gray.white,

    // Semantic colors
    accentTips: "#FFA10B",
    mascotAqua: colors.mascot.aqua,
    mascotBrightBlue: colors.mascot.brightBlue,
  },
  space: {
    ...spacing,
    true: spacing[4], // 預設 spacing 為 $4 (16px)
  },
  radius: {
    ...radius,
    true: radius.md, // 預設 radius 為 md
  },
});

// 主題配置
const lightTheme = {
  background: "#FFFFFF",
  backgroundHover: colors.basic[50],
  backgroundPress: colors.basic[100],
  backgroundFocus: colors.basic[50],
  backgroundStrong: colors.basic[100],
  backgroundTransparent: "rgba(255,255,255,0)",

  color: colors.basic.black,
  colorHover: colors.basic[500],
  colorPress: colors.basic[400],
  colorFocus: colors.basic[500],
  colorTransparent: "rgba(0,0,0,0)",

  borderColor: colors.basic[200],
  borderColorHover: colors.basic[300],
  borderColorFocus: colors.primary.base,
  borderColorPress: colors.basic[400],

  primary: colors.primary.base,
  primaryHover: colors.primary.darker,

  shadowColor: "rgba(0,0,0,0.1)",
  shadowColorHover: "rgba(0,0,0,0.15)",
};

const darkTheme = {
  background: colors.basic[600],
  backgroundHover: colors.basic[500],
  backgroundPress: colors.basic[400],
  backgroundFocus: colors.basic[500],
  backgroundStrong: colors.basic[500],
  backgroundTransparent: "rgba(0,0,0,0)",

  color: colors.basic[50],
  colorHover: colors.basic[100],
  colorPress: colors.basic[200],
  colorFocus: colors.basic[100],
  colorTransparent: "rgba(255,255,255,0)",

  borderColor: colors.basic[400],
  borderColorHover: colors.basic[300],
  borderColorFocus: colors.primary.lighter,
  borderColorPress: colors.basic[200],

  primary: colors.primary.lighter,
  primaryHover: colors.primary.base,

  shadowColor: "rgba(0,0,0,0.3)",
  shadowColorHover: "rgba(0,0,0,0.4)",
};

const animations = createAnimations({
  fast: { type: "spring", damping: 20, mass: 1.2, stiffness: 250 },
  medium: { type: "spring", damping: 15, mass: 0.9, stiffness: 100 },
  slow: { type: "spring", damping: 20, stiffness: 60 },
});

export const config = createTamagui({
  animations,
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  shorthands,
  defaultFont: "body",
});

export default config;

// 型別宣告
export type AppConfig = typeof config;
declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
