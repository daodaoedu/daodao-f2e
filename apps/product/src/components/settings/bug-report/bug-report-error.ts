import { isApiError } from "@daodao/api";
import {
  parseServerError,
  type ResolveServerErrorOptions,
  resolveServerErrorMessage,
} from "@/lib/server-error/server-error-message";

export type BugReportFieldLabelKey = "bug_area_label" | "bug_description_label" | "bug_link_label";
export type BugReportErrorMessageKey =
  | BugReportFieldLabelKey
  | "operation_failed_retry"
  | "bug_screenshot_limit"
  | "bug_field_separator";

export interface BugReportErrorOptions {
  locale: ResolveServerErrorOptions["locale"];
  t: (key: BugReportErrorMessageKey) => string;
  /** 「請求資料格式錯誤：{fields}」，ICU 參數由呼叫端代入 */
  tInvalidFields: (fields: string) => string;
  serverT: ResolveServerErrorOptions["t"];
}

// server 驗證錯誤 details 的欄位 → 表單上的欄位名稱
const FIELD_LABEL_KEYS: Record<string, BugReportFieldLabelKey | undefined> = {
  area: "bug_area_label",
  description: "bug_description_label",
  link: "bug_link_label",
};

// 只有輸入驗證錯誤才給具體訊息；401／403／413／429／5xx／網路錯誤一律用通用訊息
const SERVER_MESSAGE_STATUSES = new Set([400, 422]);

/**
 * 錯誤回報送出失敗時要顯示的訊息（server 訊息只有中文，一律經 i18n 轉換，見 daodao#353）：
 * - 400／422 且 details 指到表單欄位：「請求資料格式錯誤：相關連結（選填）」
 * - 400 FILE_UPLOAD_ERROR（截圖太大／太多）：截圖限制說明
 * - 其他 400／422：共用的 server 錯誤轉換
 * - 其他：i18n 通用訊息「操作失敗，請稍後再試」
 */
export function resolveBugReportErrorMessage(
  error: unknown,
  { locale, t, tInvalidFields, serverT }: BugReportErrorOptions
): string {
  if (!isApiError(error) || !SERVER_MESSAGE_STATUSES.has(error.status)) {
    return t("operation_failed_retry");
  }

  const fields = Object.keys(parseServerError(error).details ?? {})
    .map((key) => FIELD_LABEL_KEYS[key])
    .filter((key): key is BugReportFieldLabelKey => Boolean(key))
    .map((key) => t(key));
  if (fields.length > 0) return tInvalidFields(fields.join(t("bug_field_separator")));

  return resolveServerErrorMessage(error, {
    locale,
    t: serverT,
    fallback: t("operation_failed_retry"),
    // multer 的大小／數量超過都回 FILE_UPLOAD_ERROR，分不出是哪一種，直接說明截圖限制
    codeMessages: { FILE_UPLOAD_ERROR: t("bug_screenshot_limit") },
  });
}
