/**
 * 教育階段選項
 * 對應資料庫 education_stage_t 枚舉
 * value: 英文鍵值（傳送給後端）
 * label: 中文顯示名稱（前端顯示）
 */
export const EDUCATION_STAGE_OPTIONS = [
  { value: "high", label: "高中/職" },
  { value: "associate", label: "專科" },
  { value: "university", label: "大學" },
  { value: "master", label: "碩士" },
  { value: "doctorate", label: "博士" },
  { value: "other", label: "其他" },
] as const;

export type EducationStageValue = (typeof EDUCATION_STAGE_OPTIONS)[number]["value"];
export type EducationStageLabel = (typeof EDUCATION_STAGE_OPTIONS)[number]["label"];
