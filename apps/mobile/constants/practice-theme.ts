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
 * 實踐主題配置
 * 單一來源定義所有主題相關信息（顏色值）
 */
const PRACTICE_THEME_CONFIG = [
  {
    name: PracticeTheme.yellow,
    color: "#FCDD84",
  },
  {
    name: PracticeTheme.blue,
    color: "#C3EEFF",
  },
  {
    name: PracticeTheme.pink,
    color: "#FFC0C8",
  },
  {
    name: PracticeTheme.green,
    color: "#A0E8D0",
  },
] as const;

/**
 * 主題顏色列表（用於循環選擇）
 */
export const PRACTICE_THEMES: PracticeTheme[] = PRACTICE_THEME_CONFIG.map((config) => config.name);

/**
 * 主題顏色值映射
 */
export const practiceThemeColorMap = Object.fromEntries(
  PRACTICE_THEME_CONFIG.map((config) => [config.name, config.color])
) as Record<PracticeTheme, string>;

/**
 * 顏色值到主題名稱的反向映射
 */
const themeColorToThemeMap = new Map<string, PracticeTheme>(
  PRACTICE_THEME_CONFIG.map((config) => [config.color, config.name])
);

/**
 * 根據顏色值取得主題名稱
 */
export const getThemeNameFromColor = (color: string): PracticeTheme => {
  return themeColorToThemeMap.get(color) ?? PracticeTheme.yellow;
};

/**
 * 根據實踐 ID 計算主題索引
 * 使用 ID 的 hash 來決定主題，確保相同 ID 總是得到相同的主題
 */
const getThemeIndexFromId = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % PRACTICE_THEMES.length;
};

/**
 * 根據實踐 ID 生成主題名稱
 * 使用 ID 的 hash 來決定主題，確保相同 ID 總是得到相同的主題
 */
export const getThemeNameFromId = (id: string): PracticeTheme => {
  const index = getThemeIndexFromId(id);
  return PRACTICE_THEMES[index] ?? PracticeTheme.yellow;
};

/**
 * 根據實踐 ID 生成主題顏色值
 * 使用 ID 的 hash 和 themeColor 映射來決定主題顏色，確保相同 ID 總是得到相同的主題顏色
 */
export const getThemeFromId = (id: string): string => {
  const theme = getThemeNameFromId(id);
  return practiceThemeColorMap[theme] ?? practiceThemeColorMap[PracticeTheme.yellow];
};
