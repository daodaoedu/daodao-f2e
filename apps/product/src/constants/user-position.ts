/**
 * 用戶身份選項
 * 對應資料庫 position 表
 * value: 英文鍵值（傳送給後端）
 * label: 中文顯示名稱（前端顯示）
 */
export const POSITION_OPTIONS = [
  // 原有選項
  { value: "normal_student", label: "一般學生" },
  { value: "experimental_education_student", label: "實驗教育學生" },
  { value: "experimental_educator", label: "實驗教育工作者" },
  { value: "educator", label: "教育工作者" },
  { value: "parents", label: "家長" },
  // 軍公教
  { value: "civil_servant", label: "公務員" },
  { value: "military", label: "軍人" },
  { value: "teacher", label: "教師" },
  { value: "police_firefighter", label: "警消人員" },
  // 專業人士
  { value: "medical_staff", label: "醫護人員" },
  { value: "lawyer", label: "律師" },
  { value: "accountant", label: "會計師" },
  { value: "architect", label: "建築師" },
  { value: "social_worker", label: "社工" },
  // 科技/工程
  { value: "software_engineer", label: "軟體工程師" },
  { value: "hardware_engineer", label: "硬體工程師" },
  { value: "it_professional", label: "資訊人員" },
  { value: "data_analyst", label: "數據分析師" },
  // 商業/金融
  { value: "finance", label: "金融業" },
  { value: "insurance", label: "保險業" },
  { value: "sales", label: "業務" },
  { value: "marketing", label: "行銷" },
  { value: "hr", label: "人資" },
  { value: "management", label: "管理職" },
  // 設計/創意/媒體
  { value: "designer", label: "設計師" },
  { value: "media", label: "媒體業" },
  { value: "artist", label: "藝術家" },
  { value: "content_creator", label: "內容創作者" },
  // 服務業
  { value: "food_beverage", label: "餐飲業" },
  { value: "retail", label: "零售業" },
  { value: "tourism", label: "旅遊業" },
  { value: "beauty", label: "美容美髮" },
  { value: "hospitality", label: "飯店業" },
  // 製造/技術/勞動
  { value: "manufacturing", label: "製造業" },
  { value: "construction", label: "營建業" },
  { value: "transportation", label: "運輸業" },
  { value: "technician", label: "技術人員" },
  { value: "agriculture", label: "農業" },
  // 自由/創業
  { value: "freelancer", label: "自由工作者" },
  { value: "business_owner", label: "企業主" },
  { value: "startup", label: "創業者" },
  // 其他身份
  { value: "homemaker", label: "家管" },
  { value: "retired", label: "退休" },
  { value: "unemployed", label: "待業中" },
  { value: "volunteer", label: "志工" },
  { value: "other", label: "其他" },
] as const;

export type PositionValue = (typeof POSITION_OPTIONS)[number]["value"];
export type PositionLabel = (typeof POSITION_OPTIONS)[number]["label"];
