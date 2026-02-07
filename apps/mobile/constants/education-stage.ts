/**
 * 教育階段運行時常數（表單值）
 */
export const EducationStage = {
  unlimited: "unlimited",
  elementary: "elementary",
  junior: "junior",
  senior: "senior",
  university: "university",
  graduate: "graduate",
  other: "other",
} as const;

/**
 * 教育階段類型（表單值）
 */
export type EducationStage = (typeof EducationStage)[keyof typeof EducationStage];

/**
 * API 教育階段值
 */
export type ApiEducationStage =
  | "elementary"
  | "junior_high"
  | "high"
  | "associate"
  | "university"
  | "master"
  | "doctorate"
  | "other";

/**
 * API 教育階段值到表單值的映射
 */
const ApiEducationStageToFormMap: Record<ApiEducationStage, EducationStage> = {
  university: EducationStage.university,
  associate: EducationStage.university,
  master: EducationStage.university,
  doctorate: EducationStage.university,
  high: EducationStage.senior,
  elementary: EducationStage.senior,
  junior_high: EducationStage.senior,
  other: EducationStage.other,
} as const;

/**
 * 簡化的 API 教育階段值（實際 API 接受的簡化值）
 */
export type SimplifiedApiEducationStage = "university" | "high" | "other";

/**
 * 表單值到 API 教育階段值的映射
 */
const FormEducationStageToApiMap: Partial<Record<EducationStage, SimplifiedApiEducationStage>> = {
  [EducationStage.university]: "university",
  [EducationStage.graduate]: "university",
  [EducationStage.senior]: "high",
  [EducationStage.junior]: "high",
  [EducationStage.elementary]: "high",
  [EducationStage.other]: "other",
  [EducationStage.unlimited]: "other",
} as const;

/**
 * 教育階段選項列表
 */
export const EDUCATION_STAGE_OPTIONS = [
  { value: EducationStage.unlimited, label: "不設限" },
  { value: EducationStage.elementary, label: "國小" },
  { value: EducationStage.junior, label: "國中" },
  { value: EducationStage.senior, label: "高中" },
  { value: EducationStage.university, label: "大學" },
  { value: EducationStage.graduate, label: "研究所" },
] as const;

/**
 * 將 API 的 educationStage 值對應到表單值
 */
export const mapApiEducationStageToForm = (apiValue: string | null | undefined): string => {
  if (!apiValue) return "";
  const formValue = ApiEducationStageToFormMap[apiValue as ApiEducationStage];
  return formValue || EducationStage.other;
};

/**
 * 將表單的 educationStage 值對應到 API 值
 */
export const mapFormEducationStageToApi = (
  formValue: string
): SimplifiedApiEducationStage | undefined => {
  if (!formValue) return undefined;
  const apiValue = FormEducationStageToApiMap[formValue as EducationStage];
  return apiValue as SimplifiedApiEducationStage | undefined;
};
