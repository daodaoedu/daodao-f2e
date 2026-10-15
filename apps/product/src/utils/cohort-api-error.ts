/**
 * 把 lighthouse 場次 API 的錯誤回應轉成可顯示的訊息來源。
 *
 * server 回應形狀：
 * - 400 驗證失敗：`{ error: { type: "bad_request", message: "驗證失敗", details: [{ path, message }] } }`
 * - 409 / 403 等：`{ error: { code: "APP_ERROR", message: "同一系列下不可使用重複 slug" } }`
 *
 * 前端已知欄位對應到既有 i18n key；其餘帶 path 的細節直接顯示 server 訊息；都沒有才退回通用訊息。
 */

export const COHORT_FIELD_ERROR_KEYS = {
  slug: "cohort_slug_error",
  interactionModes: "cohort_interaction_modes_error",
  feeAmount: "cohort_fee_amount_error",
  externalSignupUrl: "cohort_external_signup_url_error",
  endDate: "cohort_date_error",
} as const;

export type CohortFieldErrorKey =
  (typeof COHORT_FIELD_ERROR_KEYS)[keyof typeof COHORT_FIELD_ERROR_KEYS];

export type CohortApiErrorResolution =
  | { type: "i18n"; key: CohortFieldErrorKey }
  | { type: "message"; message: string }
  | { type: "fallback" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export function resolveCohortApiError(error: unknown): CohortApiErrorResolution {
  if (!isRecord(error)) return { type: "fallback" };
  const inner = isRecord(error.error) ? error.error : error;

  const details = Array.isArray(inner.details) ? inner.details : [];
  for (const detail of details) {
    if (!isRecord(detail)) continue;
    const path = readString(detail, "path");
    const message = readString(detail, "message");
    if (path && path in COHORT_FIELD_ERROR_KEYS) {
      return {
        type: "i18n",
        key: COHORT_FIELD_ERROR_KEYS[path as keyof typeof COHORT_FIELD_ERROR_KEYS],
      };
    }
    if (message) return { type: "message", message: path ? `${path}: ${message}` : message };
  }

  const message = readString(inner, "message") ?? readString(error, "message");
  return message ? { type: "message", message } : { type: "fallback" };
}

/**
 * 通用版：把任何 lighthouse API 錯誤轉成可直接 toast 的文字。
 * 400 有 details 時顯示第一條欄位訊息（server 的 zod message 已是給人看的中文，不再加 path 前綴），
 * 否則顯示 server message，都沒有才退回 fallback。
 * 模板庫／組織設定／AI key／成果摘要等沒有欄位 i18n 對照的表單用這個，避免 #188 那種「驗證失敗」通用訊息。
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error)) return fallback;
  const inner = isRecord(error.error) ? error.error : error;
  const details = Array.isArray(inner.details) ? inner.details : [];
  for (const detail of details) {
    if (!isRecord(detail)) continue;
    const message = readString(detail, "message");
    if (message) return message;
  }
  return readString(inner, "message") ?? readString(error, "message") ?? fallback;
}
