/**
 * DaoDao 色彩系統
 *
 * hex 為單一來源；Web 端真來源是 packages/ui/src/styles/globals.css 的 oklch。
 * 兩者必須等價：`generate:mobile` 腳本會在生成前用無損 hex↔oklch 轉換驗證
 * 「有 CSS 對應」的 token（見 scripts/generate-mobile.ts 的 CSS_TOKEN_MAP），
 * 一旦漂移就讓 build 失敗，避免再次靠人肉手抄而悄悄走鐘。
 *
 * 註：quiz / practice / border.lightCyan / basic.50 等
 * token 在 globals.css 沒有對應，屬 mobile 專屬，不納入驗證。
 * background.lightCyan 對應 CSS --light-cyan（執行時機卡、資源縮圖底色等）。
 */
export const colors = {
  // 主色 - Primary variants（對應 --primary-*）
  primary: {
    palest: "#F3FCFC",
    pale: "#EEF9F9",
    lightest: "#DEF5F5",
    lighter: "#89DAD7",
    base: "#16B9B3",
    darker: "#295E5C",
  },

  // 灰階 - Figma 灰階色（取代原 basic 系列）
  gray: {
    dark: "#0D3036", // BG Dark
    mid: "#9FB5B8", // Light Gray
    light: "#E4EAE9", // BG Gray
    veryLight: "#F4F6F6", // Very Light Gray
    white: "#FFFFFF", // White
  },

  // 吉祥物色彩 - Mascot colors（對應 --mascot-*）
  mascot: {
    aqua: "#98ECFF",
    brightBlue: "#4AE8FF",
  },

  // Logo 色彩（對應 --logo-*）
  logo: {
    gray: "#536166",
    cyan: "#16B9B3",
    orange: "#FFA10E",
    yellow: "#F9E41E",
  },

  // 背景色彩
  background: {
    light: "#FFFFFF",
    dark: "#0D3036", // --bg-dark
    gray: "#E4EAE9", // --bg-gray
    veryLightGray: "#F4F6F6", // --very-light-gray
    veryLightBlue: "#F5FFFD", // --very-light-blue
    /** 對應 CSS --light-cyan（mint 青，非 sky blue） */
    lightCyan: "#A9EDE8",
  },

  // 文字色彩 - 對應 CSS 變數
  text: {
    dark: "#295E5C", // --text-dark
    light: "#FFFFFF",
    muted: "#9FB5B8", // --light-gray
  },

  // 邊框色彩
  border: {
    light: "#E5E5E5", // --border
    lightCyan: "#C1ECFF", // mobile 專屬，無 CSS 對應
    white: "#FFFFFF",
  },

  // Quiz 島嶼主題色（mobile 專屬，無 CSS 對應）
  quiz: {
    d: { bg: "#E9F3F5", text: "#48809A", accent: "#99ECFF" }, // 探探島
    a: { bg: "#F5F0E9", text: "#9A6948", accent: "#FFA10B" }, // 動動島
    o: { bg: "#E9F5EE", text: "#489A95", accent: "#16B9B3" }, // 構構島
    l: { bg: "#F5EDE9", text: "#CB6738", accent: "#FF6E0B" }, // 跨跨島
    c: { bg: "#F5F4E9", text: "#9D8242", accent: "#F9E41C" }, // 連連島
  },

  // 實踐主題色（mobile 專屬，無 CSS 對應）
  practice: {
    yellow: "#FFD700",
    blue: "#3B82F6",
    pink: "#EC4899",
    green: "#10B981",
  },

  // 中性灰階 - 供 Mobile 使用（數字 scale，對應 --basic-*）
  basic: {
    50: "#FAFAFA", // mobile 專屬，無 CSS 對應
    100: "#F3F3F3",
    200: "#DBDBDB",
    300: "#92989A",
    400: "#536166",
    500: "#293A3D",
    600: "#0D3036",
    white: "#FFFFFF",
    black: "#011416",
  },

  // 語意色彩 - Semantic colors（success/tips 對應 --success/--tips）
  semantic: {
    success: "#86C84A",
    warning: "#F59E0B", // mobile 專屬，無 CSS 對應
    error: "#EF4444", // mobile 專屬，無 CSS 對應
    info: "#3B82F6", // mobile 專屬，無 CSS 對應
    tips: "#FFA10E",
  },
} as const;

export type Colors = typeof colors;
