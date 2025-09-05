export const PLAN_FEATURES = [
  '建立學習計劃和主題實踐',
  '分享學習想法和資源',
  'AI 學習建議和分析',
  '成長地圖看見自己的進步和機會',
  '優先獲得新功能體驗',
] as const;

export const PLAN_DETAILS = {
  title: '探索所有功能，完全免費！',
  subtitle: '作為早期使用者，你將可以免費使用所有功能',
  buttonText: '立即免費註冊',
  note: 'Beta 期間完全免費 • 無需信用卡',
} as const;

export type PlanFeature = typeof PLAN_FEATURES[number];
