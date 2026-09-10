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
