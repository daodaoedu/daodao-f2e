/**
 * 學習類型主題對應表
 * 對齊 packages/features/quiz/src/utils/theme-map.ts 和 result-detail-map.ts
 */

export interface IQuizTheme {
  title: string; // 島名
  tags: string[]; // 特質標籤
}

export const quizThemeMap: Record<string, IQuizTheme> = {
  D: { title: "探探島", tags: ["注重推理", "觀察"] },
  A: { title: "動動島", tags: ["實作", "行動派"] },
  O: { title: "構構島", tags: ["結構化", "規劃"] },
  L: { title: "跨跨島", tags: ["跨領域", "多元思維"] },
  C: { title: "連連島", tags: ["協作", "敏銳"] },
};

/**
 * 根據 resultType 取得學習類型顯示文字
 * e.g. "注重推理的探探島"
 */
export function getQuizThemeMessage(resultType: string | undefined | null): string | null {
  if (!resultType) return null;
  const theme = quizThemeMap[resultType.toUpperCase()];
  if (!theme) return null;
  return `${theme.tags[0]}的${theme.title}`;
}

const WEBSITE_URL = process.env.EXPO_PUBLIC_WEBSITE_URL ?? "https://daodao.so";

/**
 * 測驗填答流程僅在 apps/website 實作，App 內導去該網址進行測驗
 */
export function getQuizUrl(): string {
  return `${WEBSITE_URL}/quiz`;
}
