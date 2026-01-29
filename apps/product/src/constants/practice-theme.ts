import { BlueSvg, GreenSvg, PinkSvg, YellowSvg } from "@daodao/assets";

/**
 * 實踐主題顏色運行時常數
 */
export const PracticeTheme = {
  yellow: "yellow",
  blue: "blue",
  pink: "pink",
  green: "green",
} as const;

/**
 * 實踐主題顏色類型
 */
export type PracticeTheme = (typeof PracticeTheme)[keyof typeof PracticeTheme];

/**
 * 主題顏色列表（用於循環選擇）
 */
export const PRACTICE_THEMES: PracticeTheme[] = [
  PracticeTheme.yellow,
  PracticeTheme.blue,
  PracticeTheme.pink,
  PracticeTheme.green,
];

/**
 * 主題顏色對應的 SVG 組件映射
 */
export const practiceThemeSvgMap = {
  [PracticeTheme.yellow]: YellowSvg,
  [PracticeTheme.blue]: BlueSvg,
  [PracticeTheme.pink]: PinkSvg,
  [PracticeTheme.green]: GreenSvg,
} as const;

/**
 * 根據實踐 ID 生成主題顏色
 * 使用 ID 的 hash 來決定主題，確保相同 ID 總是得到相同的主題
 */
export const getThemeFromId = (id: string): PracticeTheme => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PRACTICE_THEMES.length;
  return PRACTICE_THEMES[index] ?? PracticeTheme.yellow;
};
