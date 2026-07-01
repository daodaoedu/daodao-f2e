import type { PracticeSummary } from "@daodao/api";

/**
 * 實踐總結頁面的階段
 * - active: 進行中（距結束超過 5 天）
 * - ending: 即將結束（距結束 5 天內）
 * - ended-deep: 已結束且深度完成（進度達 70%）
 * - ended-low: 已結束但完成度較低
 */
export type PracticeStage = "active" | "ending" | "ended-deep" | "ended-low";

/**
 * 計算實踐總結頁面所處的階段
 * @param summary 實踐總結資料
 * @returns 目前所處的階段
 */
export function usePracticeStage(summary: PracticeSummary): PracticeStage {
  if (summary.status === "active" || summary.status === "not_started") {
    const endDate = new Date(summary.endDate);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 5 ? "ending" : "active";
  }
  return summary.progressPercentage >= 70 ? "ended-deep" : "ended-low";
}

/**
 * 判斷階段是否已經結束（實踐已完成）
 * @param stage 實踐階段
 */
export function isEnded(stage: PracticeStage): boolean {
  return stage === "ended-deep" || stage === "ended-low";
}

/**
 * 判斷是否已解鎖洞察功能
 * @description 需符合進度、平均字數與實踐狀態三項條件
 * @param summary 實踐總結資料
 */
export function isInsightUnlocked(summary: PracticeSummary): boolean {
  return (
    summary.progressPercentage >= 70 &&
    summary.avgWords >= 30 &&
    (summary.status === "completed" || summary.status === "archived")
  );
}
