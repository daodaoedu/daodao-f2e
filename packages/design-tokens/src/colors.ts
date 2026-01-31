/**
 * DaoDao 色彩系統
 * 從 globals.css oklch 值轉換而來
 * 這是 Web 與 Mobile 共用的主要來源
 */
export const colors = {
  // 主色 - Primary variants
  primary: {
    palest: '#E6F7F9',
    pale: '#D9F3F5',
    lightest: '#B3E8E6',
    lighter: '#66D4CF',
    base: '#16B9B3',
    darker: '#0D7A77',
  },

  // 灰階 - Basic colors
  basic: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#A3A3A3',
    400: '#6B7280',
    500: '#404040',
    600: '#2D3A4F',
    white: '#FFFFFF',
    black: '#1A2B3C',
  },

  // 吉祥物色彩 - Mascot colors
  mascot: {
    aqua: '#7DD3E3',
    brightBlue: '#5CC5E8',
  },

  // 語意色彩 - Semantic colors
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    tips: '#FACC15',
  },

  // Logo 色彩
  logo: {
    gray: '#6B7280',
    cyan: '#16B9B3',
    orange: '#F97316',
    yellow: '#FACC15',
  },

  // 背景色彩
  background: {
    light: '#FFFFFF',
    dark: '#2D3A4F',
    gray: '#F3F4F6',
    veryLightGray: '#FAFAFA',
    veryLightBlue: '#F0FDFA',
  },

  // Quiz 島嶼主題色
  quiz: {
    d: { bg: '#E9F3F5', text: '#48809A', accent: '#99ECFF' }, // 探探島
    a: { bg: '#F5F0E9', text: '#9A6948', accent: '#FFA10B' }, // 動動島
    o: { bg: '#E9F5EE', text: '#489A95', accent: '#16B9B3' }, // 構構島
    l: { bg: '#F5EDE9', text: '#CB6738', accent: '#FF6E0B' }, // 跨跨島
    c: { bg: '#F5F4E9', text: '#9D8242', accent: '#F9E41C' }, // 連連島
  },

  // 實踐主題色
  practice: {
    yellow: '#FFD700',
    blue: '#3B82F6',
    pink: '#EC4899',
    green: '#10B981',
  },
} as const

export type Colors = typeof colors
