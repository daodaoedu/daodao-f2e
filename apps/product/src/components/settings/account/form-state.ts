import { parse } from "date-fns";
import type { UseFormSetValue } from "react-hook-form";
import type { AccountFormValues } from "./schema";

/** /users/me 回應中帳號設定頁會用到的欄位；未填的欄位 server 回 null */
export type AccountFormUser = {
  email?: string | null;
  birthDay?: string | null;
  positionList?: string[] | null;
  educationStage?: string | null;
  professionalField?: string[] | null;
  interestList?: string[] | null;
};

/** 把 server 的使用者資料轉成表單初始值（null → 空值），作為 dirty 比對的基準 */
export const toAccountFormValues = (user: AccountFormUser): AccountFormValues => ({
  email: user.email || "",
  birthday: user.birthDay ? parse(user.birthDay, "yyyy-MM-dd", new Date()) : undefined,
  position: user.positionList || [],
  educationStage: user.educationStage || "",
  professionalFields: user.professionalField || [],
  explorationFields: user.interestList || [],
});

/**
 * 教育階段 Select 的 onValueChange。
 *
 * Radix Select 在表單內會渲染隱藏的原生 `<select>`；使用者資料非同步載入、`form.reset()` 把值
 * 從 "" 換成既有值時，原生 select 還沒有對應的 option，會自己發出 change 事件，
 * 讓 onValueChange 收到 ""（daodao#296：沒改任何欄位就被判定 dirty，且教育階段被清空）。
 * 所有教育階段選項的 value 都非空，使用者不可能選到 ""，所以直接忽略。
 */
export const createEducationStageChangeHandler =
  (field: { onChange: (value: string) => void; onBlur: () => void }) => (value: string) => {
    if (value === "") return;
    field.onChange(value);
    field.onBlur();
  };

/**
 * 使用者從 sheet 選完或按「清除」時寫回欄位。
 * `setValue` 預設不會更新 formState.isDirty，要帶 shouldDirty，離開時的未儲存確認才會出現。
 */
export const setUserSelectedFields = (
  setValue: UseFormSetValue<AccountFormValues>,
  name: "position" | "professionalFields" | "explorationFields",
  fields: string[]
) => {
  setValue(name, fields, { shouldDirty: true });
};
