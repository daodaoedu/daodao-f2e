/**
 * 用戶身份選項
 * 對應資料庫 position 表
 * value: 英文鍵值（傳送給後端）
 * label: 中文顯示名稱（前端顯示）
 */
export const POSITION_OPTIONS = [
  // 原有選項
  { value: "normal_student", label: "normal_student" },
  { value: "experimental_education_student", label: "experimental_education_student" },
  { value: "experimental_educator", label: "experimental_educator" },
  { value: "educator", label: "educator" },
  { value: "parents", label: "parents" },
  // 軍公教
  { value: "civil_servant", label: "civil_servant" },
  { value: "military", label: "military" },
  { value: "teacher", label: "teacher" },
  { value: "police_firefighter", label: "police_firefighter" },
  // 專業人士
  { value: "medical_staff", label: "medical_staff" },
  { value: "lawyer", label: "lawyer" },
  { value: "accountant", label: "accountant" },
  { value: "architect", label: "architect" },
  { value: "social_worker", label: "social_worker" },
  // 科技/工程
  { value: "software_engineer", label: "software_engineer" },
  { value: "hardware_engineer", label: "hardware_engineer" },
  { value: "it_professional", label: "it_professional" },
  { value: "data_analyst", label: "data_analyst" },
  // 商業/金融
  { value: "finance", label: "finance" },
  { value: "insurance", label: "insurance" },
  { value: "sales", label: "sales" },
  { value: "marketing", label: "marketing" },
  { value: "hr", label: "hr" },
  { value: "management", label: "management" },
  // 設計/創意/媒體
  { value: "designer", label: "designer" },
  { value: "media", label: "media" },
  { value: "artist", label: "artist" },
  { value: "content_creator", label: "content_creator" },
  // 服務業
  { value: "food_beverage", label: "food_beverage" },
  { value: "retail", label: "retail" },
  { value: "tourism", label: "tourism" },
  { value: "beauty", label: "beauty" },
  { value: "hospitality", label: "hospitality" },
  // 製造/技術/勞動
  { value: "manufacturing", label: "manufacturing" },
  { value: "construction", label: "construction" },
  { value: "transportation", label: "transportation" },
  { value: "technician", label: "technician" },
  { value: "agriculture", label: "agriculture" },
  // 自由/創業
  { value: "freelancer", label: "freelancer" },
  { value: "business_owner", label: "business_owner" },
  { value: "startup", label: "startup" },
  // 其他身份
  { value: "homemaker", label: "homemaker" },
  { value: "retired", label: "retired" },
  { value: "unemployed", label: "unemployed" },
  { value: "volunteer", label: "volunteer" },
  { value: "other", label: "other" },
] as const;

export type PositionValue = (typeof POSITION_OPTIONS)[number]["value"];
export type PositionLabel = (typeof POSITION_OPTIONS)[number]["label"];
