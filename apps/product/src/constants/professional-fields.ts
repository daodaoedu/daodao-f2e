/**
 * 專業領域選項列表
 * 對應資料庫 professional_fields 表
 * value: 英文鍵值（傳送給後端）
 * label: 中文顯示名稱（前端顯示）
 */
export const AVAILABLE_FIELDS = [
  { value: "technology_ict", label: "technology_ict" },
  { value: "business_management", label: "business_management" },
  { value: "arts_creative_design", label: "arts_creative_design" },
  { value: "science_research", label: "science_research" },
  { value: "engineering_manufacturing", label: "engineering_manufacturing" },
  { value: "health_medicine", label: "health_medicine" },
  { value: "education_learning", label: "education_learning" },
  { value: "social_sciences", label: "social_sciences" },
  { value: "languages", label: "languages" },
  { value: "law", label: "law" },
  { value: "customer_service_hospitality", label: "customer_service_hospitality" },
  { value: "agriculture_environmental_sciences", label: "agriculture_environmental_sciences" },
  { value: "others", label: "others" },
] as const;

export type ProfessionalFieldValue = (typeof AVAILABLE_FIELDS)[number]["value"];
export type ProfessionalFieldLabel = (typeof AVAILABLE_FIELDS)[number]["label"];
