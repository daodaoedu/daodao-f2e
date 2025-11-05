import { AuthState } from './auth-types';

/**
 * 用戶業務規則
 * 包含用戶相關的業務邏輯判斷和驗證規則
 */

/**
 * 檢查用戶資料是否完整
 * 業務規則：用戶必須填寫所有必要欄位才算完整
 */
export const checkProfileComplete = (data: AuthState['user']) => {
  if (!data) return false;

  // 必須至少有一個聯絡方式
  const hasAnySocialCode = Object.values(data.contactList || {}).some(
    (socialCode) => Boolean(socialCode)
  );
  if (!hasAnySocialCode) return false;

  // 必填欄位檢查
  const requiredFields = [
    'name',
    'birthDay',
    'gender',
    'roleList',
    'wantToDoList',
    'tagList',
    'selfIntroduction',
  ] as const;

  return requiredFields.every((field) =>
    Boolean(Array.isArray(data[field]) ? data[field].length : data[field])
  );
};
