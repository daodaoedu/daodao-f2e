/**
 * 興趣類別選項列表
 * 對應資料庫 categories 表
 * value: 英文鍵值（傳送給後端）
 * label: 中文顯示名稱（前端顯示）
 */
export const INTEREST_CATEGORIES = [
  { value: "nature_environment", label: "自然與環境" },
  { value: "mathematical_logic", label: "數理與邏輯" },
  { value: "information_computer_science", label: "資訊與電腦科學" },
  { value: "languages", label: "語言" },
  { value: "humanities_history_geography", label: "人文、歷史與地理" },
  { value: "sociology_psychology", label: "社會學與心理學" },
  { value: "education_learning", label: "教育與學習" },
  { value: "business_management_finance", label: "商管與理財" },
  { value: "arts_design", label: "藝術與設計" },
  { value: "lifestyle", label: "生活風格與品味" },
  { value: "social_innovation_sustainability", label: "社會創新與永續" },
  { value: "medicine_sports", label: "醫學與運動" },
  { value: "personal_development", label: "個人成長" },
  { value: "others", label: "其他" },
] as const;

export type InterestCategoryValue = (typeof INTEREST_CATEGORIES)[number]["value"];
export type InterestCategoryLabel = (typeof INTEREST_CATEGORIES)[number]["label"];
