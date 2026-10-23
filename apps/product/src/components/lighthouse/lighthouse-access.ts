/** 沒有燈塔權限的人申請開通專屬燈塔的表單（daodao#354）。 */
export const LIGHTHOUSE_APPLY_FORM_URL = "https://tally.so/r/44WXdk";

/**
 * access-required 頁要顯示哪種說明（daodao#384）：
 * - `unavailable`：middleware 查詢權限失敗（server 錯誤、逾時），請使用者稍後再試
 * - `membership`：查詢成功但沒有燈塔組織，顯示 #354 的未開通說明
 */
export type LighthouseAccessRequiredReason = "membership" | "unavailable";

export const resolveLighthouseAccessRequiredReason = (
  reason: string | string[] | undefined
): LighthouseAccessRequiredReason => {
  const value = Array.isArray(reason) ? reason[0] : reason;
  return value === "unavailable" ? "unavailable" : "membership";
};
