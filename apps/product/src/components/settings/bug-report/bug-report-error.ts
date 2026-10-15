import { isApiError } from "@daodao/api";

export type BugReportFieldLabelKey = "bug_area_label" | "bug_description_label" | "bug_link_label";
export type BugReportErrorMessageKey = BugReportFieldLabelKey | "operation_failed_retry";

// server 驗證錯誤 details 的欄位 → 表單上的欄位名稱
const FIELD_LABEL_KEYS: Record<string, BugReportFieldLabelKey | undefined> = {
  area: "bug_area_label",
  description: "bug_description_label",
  link: "bug_link_label",
};

// 只有輸入驗證錯誤才把 server 訊息給使用者看；401／403／413／429／5xx／網路錯誤一律用通用訊息
const SERVER_MESSAGE_STATUSES = new Set([400, 422]);

/**
 * 錯誤回報送出失敗時要顯示的訊息：
 * - 400／422：server 訊息 + 出錯欄位名稱（例：「請求資料格式錯誤：相關連結（選填）」）
 * - 其他：i18n 通用訊息「操作失敗，請稍後再試」
 */
export function resolveBugReportErrorMessage(
  error: unknown,
  t: (key: BugReportErrorMessageKey) => string
): string {
  if (!isApiError(error) || !SERVER_MESSAGE_STATUSES.has(error.status) || !error.message) {
    return t("operation_failed_retry");
  }

  const details = (error.data as { details?: Record<string, string> } | undefined)?.details;
  const fields = Object.keys(details ?? {})
    .map((key) => FIELD_LABEL_KEYS[key])
    .filter((key): key is BugReportFieldLabelKey => Boolean(key))
    .map((key) => t(key));

  return fields.length > 0 ? `${error.message}：${fields.join("、")}` : error.message;
}
