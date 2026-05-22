/**
 * 興趣類別選項列表
 * 對應資料庫 categories 表
 * value: 英文鍵值（傳送給後端）
 * label: 中文顯示名稱（前端顯示）
 */
export const INTEREST_CATEGORIES = [
  { value: "nature_environment", label: "nature_environment" },
  { value: "mathematical_logic", label: "mathematical_logic" },
  { value: "information_computer_science", label: "information_computer_science" },
  { value: "languages", label: "languages" },
  { value: "humanities_history_geography", label: "humanities_history_geography" },
  { value: "sociology_psychology", label: "sociology_psychology" },
  { value: "education_learning", label: "education_learning" },
  { value: "business_management_finance", label: "business_management_finance" },
  { value: "arts_design", label: "arts_design" },
  { value: "lifestyle", label: "lifestyle" },
  { value: "social_innovation_sustainability", label: "social_innovation_sustainability" },
  { value: "medicine_sports", label: "medicine_sports" },
  { value: "personal_development", label: "personal_development" },
  { value: "others", label: "others" },
] as const;

export type InterestCategoryValue = (typeof INTEREST_CATEGORIES)[number]["value"];
export type InterestCategoryLabel = (typeof INTEREST_CATEGORIES)[number]["label"];
