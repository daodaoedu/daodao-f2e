import type { OptionProps } from '@/shared/ui/option';

/**
 * 專業領域選項
 */
export const EXPERTISE_AREAS: OptionProps[] = [
  { value: 'ict', label: '資訊與資訊通信技術(ICT)' },
  { value: 'business', label: '商業與管理' },
  { value: 'arts_design', label: '藝術、創意與設計' },
  { value: 'science', label: '科學與研究' },
  { value: 'engineering', label: '工程與製造' },
  { value: 'health', label: '健康與醫學' },
  { value: 'education', label: '教育與學習' },
  { value: 'social_science', label: '社會科學' },
  { value: 'language', label: '語言' },
  { value: 'law', label: '法律' },
  { value: 'service', label: '客戶服務與餐飲' },
  { value: 'agriculture', label: '農業與環境科學' },
  { value: 'other', label: '其他' },
];

/**
 * 興趣領域選項
 */
export const INTEREST_AREAS: OptionProps[] = [
  { value: 'nature', label: '自然與環境' },
  { value: 'math_logic', label: '數理邏輯' },
  { value: 'information', label: '資訊與電腦科學' },
  { value: 'language', label: '語言' },
  { value: 'humanities', label: '人文史地' },
  { value: 'social_psychology', label: '社會與心理學' },
  { value: 'education', label: '教育與學習' },
  { value: 'business_finance', label: '商管與理財' },
  { value: 'arts_design', label: '藝術與設計' },
  { value: 'lifestyle', label: '生活品味' },
  { value: 'social_innovation', label: '社會創新與永續' },
  { value: 'sports', label: '醫藥與運動' },
  { value: 'personal_development', label: '個人發展' },
  { value: 'other', label: '其他' },
];

/**
 * 推薦來源選項
 */
export const REFERRAL_SOURCES: OptionProps[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'FB' },
  { value: 'discord', label: 'Discord' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'friend_referral', label: '朋友介紹' },
  { value: 'other', label: '其他' },
];

