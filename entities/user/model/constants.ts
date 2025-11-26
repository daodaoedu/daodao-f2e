/**
 * 用戶相關類型定義和常數
 * 集中管理所有用戶相關的類型別名、枚舉和選項常數
 */

import type { OptionProps } from '@/shared/ui/option';
import type { components } from '@/shared/api';
import { optionListToEnum } from '@/shared/lib/option';

/**
 * User API 型別重新導出
 * 從 OpenAPI 生成的型別中提取 User 相關的型別
 */

export type UserSuccessResponseSchema =
  components['schemas']['user.validators_userSuccessResponseSchema'];

export type UserProfile = UserSuccessResponseSchema['data'];

// Create/Update schemas
export type CreateUserSchema =
  components['schemas']['user.validators_createUserSchema'];

export type UpdateUserSchema =
  components['schemas']['user.validators_updateUserSchema'];

// Professional Field enum
export type ProfessionalField = NonNullable<
  UserProfile['professionalField']
>[number];

// Education Stage enum
export type EducationStage = NonNullable<UserProfile['educationStage']>;

// ===== 業務相關類型 =====

/**
 * 角色枚舉
 */
export enum RoleEnum {
  /** 訪客 */
  Visitor = 1,
  /** 一般使用者 */
  // User,//暫時註解，等DB資料更新完再解開
  /** 馬拉松申請者 */
  MarathonApplicant,
  /** 馬拉松參與者 */
  MarathonParticipant,
  /** 導師 */
  Mentor,
  /** 管理者 */
  Admin,
  /** 超級管理者 */
  SuperAdmin,
}

/**
 * 用戶 ID 對象（支援 id 或 customId）
 */
export interface UserIdObject {
  id: string;
  customId?: string | null;
}

/**
 * 導航可見性類型
 */
export type NavVisibility =
  | 'all'
  | 'auth'
  | 'guest'
  | ((user: UserProfile | null) => boolean);

// ===== 選項常數 =====

/**
 * 性別選項
 */
export const GENDER_OPTIONS: OptionProps[] = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: '保持神秘' },
];

/**
 * 教育階段選項
 */
export const EDUCATION_OPTIONS: OptionProps<EducationStage>[] = [
  { value: 'high', label: '高中' },
  { value: 'university', label: '大學' },
  // TODO: 碩士、博士、不設限暫時註解，等DB資料更新完再解開
  // { value: 'master', label: '碩士' },
  // { value: 'phd', label: '博士' },
  { value: 'other', label: '不設限' },
];

export const educationStageEnum = optionListToEnum(EDUCATION_OPTIONS);

/**
 * 專業領域選項
 */
export const EXPERTISE_AREAS: OptionProps<ProfessionalField>[] = [
  {
    value: 'information_and_communication_technologies_icts',
    label: '資訊與資訊通信技術(ICT)',
  },
  { value: 'business_administration_and_law', label: '商業、管理與法律' },
  { value: 'arts_and_humanities', label: '藝術、創意與設計' },
  {
    value: 'natural_sciences_mathematics_and_statistics',
    label: '科學與研究',
  },
  {
    value: 'engineering_manufacturing_and_construction',
    label: '工程與製造',
  },
  { value: 'health_and_welfare', label: '健康與醫學' },
  { value: 'education', label: '教育與學習' },
  { value: 'social_sciences_journalism_and_information', label: '社會科學' },
  { value: 'language_skills_and_knowledge', label: '語言' },
  { value: 'services', label: '客戶服務與餐飲' },
  {
    value: 'agriculture_forestry_fisheries_and_veterinary',
    label: '農業與環境科學',
  },
  { value: 'others', label: '其他' },
];

export const expertiseAreasEnum = optionListToEnum(EXPERTISE_AREAS);

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

export const interestAreasEnum = optionListToEnum(INTEREST_AREAS);

/**
 * 角色身份選項
 */
export const ROLE_OPTIONS: OptionProps[] = [
  { value: 'experimental-education-student', label: '實驗教育學生' },
  { value: 'normal-student', label: '一般學生' },
  { value: 'experimental-educator', label: '教育工作者' },
  { value: 'citizen', label: '社會人士' },
];

export const roleEnum = optionListToEnum(ROLE_OPTIONS);

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

export const WANT_TO_DO_WITH_PARTNER: OptionProps[] = [
  { value: 'interaction', label: '學習交流' },
  { value: 'do_project', label: '做專案/競賽' },
  { value: 'make_group_class', label: '自組課程' },
  { value: 'find_group', label: '找揪團' },
  { value: 'find_teacher', label: '找老師' },
  { value: 'find_student', label: '找學生' },
];

/**
 * 聯絡方式選項
 */
export const CONTACT_PLATFORM_OPTIONS: OptionProps[] = [
  { value: 'website', label: 'Website' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'discord', label: 'Discord' },
];
