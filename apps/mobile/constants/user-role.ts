/**
 * 用戶角色運行時常數
 */
export const UserRole = {
  student: "student",
  professional: "professional",
  teacher: "teacher",
  other: "other",
} as const;

/**
 * 用戶角色類型
 */
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * API 角色值（中文）
 */
export type ApiRole = "學生" | "社會人士" | "教師" | "其他";

/**
 * API 角色值到表單角色值的映射
 */
export const ApiRoleToFormRoleMap: Record<ApiRole, UserRole> = {
  學生: UserRole.student,
  社會人士: UserRole.professional,
  教師: UserRole.teacher,
  其他: UserRole.other,
} as const;

/**
 * 表單角色值到 API 角色值的映射
 */
export const FormRoleToApiRoleMap: Record<UserRole, ApiRole> = {
  student: "學生",
  professional: "社會人士",
  teacher: "教師",
  other: "其他",
} as const;

/**
 * 角色選項列表
 */
export const ROLE_OPTIONS = [
  { value: UserRole.student, label: "學生" },
  { value: UserRole.professional, label: "社會人士" },
  { value: UserRole.teacher, label: "教師" },
  { value: UserRole.other, label: "其他" },
] as const;

/**
 * 將 API 的 roleList 值對應到表單值
 */
export const mapApiRoleToForm = (apiRoleList: string[] | null | undefined): string => {
  if (!apiRoleList || apiRoleList.length === 0) return "";
  const firstRole = apiRoleList[0];
  if (!firstRole) return "";
  return ApiRoleToFormRoleMap[firstRole as ApiRole] || "";
};

/**
 * 將表單的 role 值對應到 API 值
 */
export const mapFormRoleToApi = (formValue: string): string[] | undefined => {
  if (!formValue) return undefined;
  const apiRole = FormRoleToApiRoleMap[formValue as UserRole];
  return apiRole ? [apiRole] : undefined;
};
