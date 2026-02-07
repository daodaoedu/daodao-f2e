/**
 * 專業領域選項列表
 * 對應資料庫 professional_fields 表
 * value: 英文鍵值（傳送給後端）
 * label: 中文顯示名稱（前端顯示）
 */
export const AVAILABLE_FIELDS = [
  { value: "technology_ict", label: "資訊與資訊通信科技(ICT)" },
  { value: "business_management", label: "商業與管理" },
  { value: "arts_creative_design", label: "藝術、創意與設計" },
  { value: "science_research", label: "科學與研究" },
  { value: "engineering_manufacturing", label: "工程與製造" },
  { value: "health_medicine", label: "健康與醫學" },
  { value: "education_learning", label: "教育與學習" },
  { value: "social_sciences", label: "社會科學" },
  { value: "languages", label: "語言" },
  { value: "law", label: "法律" },
  { value: "customer_service_hospitality", label: "客戶服務與餐飲" },
  { value: "agriculture_environmental_sciences", label: "農業與環境科學" },
  { value: "others", label: "其他" },
] as const;

export type ProfessionalFieldValue = (typeof AVAILABLE_FIELDS)[number]["value"];
export type ProfessionalFieldLabel = (typeof AVAILABLE_FIELDS)[number]["label"];
