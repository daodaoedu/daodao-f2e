import { isApiError } from "@daodao/api";
import { type Locale, routing } from "@daodao/i18n/routing";

/**
 * daodao-server 的錯誤訊息全是寫死的中文（daodao#353），英文介面不能直接顯示。
 * 這裡把各種 API 錯誤轉成目前語系的訊息：
 * 1. 呼叫端指定的 code 覆寫（例：錯誤回報頁的 FILE_UPLOAD_ERROR）；預設語系下呼叫端給的 detailMessage
 * 2. 訊息固定的 code（驗證、登入過期、限流、Prisma 類）→ i18n key，兩種語系都走 i18n
 * 3. 預設語系（zh-TW）且有訊息 → 原訊息（業務錯誤多半是 APP_ERROR，原訊息比通用文字具體）
 * 4. 其他語系：依 HTTP status／粗分 code 給通用訊息
 * 5. 呼叫端的情境 fallback，最後是通用訊息；非 zh-TW 永遠不顯示 server 原文
 *
 * server 原文仍可用 parseServerError() 取出做 log。
 */

export type ServerErrorMessageKey =
  | "generic"
  | "unauthorized"
  | "session_expired"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "gone"
  | "rate_limited"
  | "validation"
  | "invalid_field"
  | "invalid_reference"
  | "data_too_long"
  | "required_field_missing"
  | "file_upload"
  | "file_too_large"
  | "file_invalid_type"
  | "file_count_exceeded";

export interface ParsedServerError {
  status?: number;
  code?: string;
  message?: string;
  details?: Record<string, string>;
}

export interface ResolveServerErrorOptions {
  locale: Locale | string;
  t: (key: ServerErrorMessageKey) => string;
  /** 情境訊息（例：「儲存失敗」），在沒有更精確訊息時使用 */
  fallback?: string;
  /** openapi-fetch 的 response.error 不帶 status，由呼叫端從 response.response.status 傳入 */
  status?: number;
  /** 呼叫端針對特定 code 的覆寫訊息（已翻譯） */
  codeMessages?: Partial<Record<string, string>>;
  /** 預設語系下優先顯示的 server 具體訊息（例：第一個欄位錯誤）；其他語系忽略 */
  detailMessage?: string;
}

// 訊息固定、與情境無關的 code：兩種語系都顯示 i18n 訊息
const CODE_KEYS: Record<string, ServerErrorMessageKey> = {
  VALIDATION_ERROR: "validation",
  INVALID_TOKEN: "session_expired",
  TOKEN_EXPIRED: "session_expired",
  AUTH_INVALID_TOKEN: "session_expired",
  AUTH_TOKEN_EXPIRED: "session_expired",
  RATE_LIMIT_EXCEEDED: "rate_limited",
  COMMON_RATE_LIMITED: "rate_limited",
  DUPLICATE_RESOURCE: "conflict",
  INVALID_REFERENCE: "invalid_reference",
  DATA_TOO_LONG: "data_too_long",
  DATABASE_DATA_TOO_LONG: "data_too_long",
  REQUIRED_FIELD_MISSING: "required_field_missing",
  DATABASE_REQUIRED_FIELD_MISSING: "required_field_missing",
  // multer 的大小／數量／非預期欄位共用這個 code，分不出是哪一種
  FILE_UPLOAD_ERROR: "file_upload",
  FILE_SIZE_EXCEEDED: "file_too_large",
  IMAGE_SIZE_EXCEEDED: "file_too_large",
  FILE_INVALID_TYPE: "file_invalid_type",
  IMAGE_INVALID_FORMAT: "file_invalid_type",
  FILE_COUNT_EXCEEDED: "file_count_exceeded",
};

// 粗分 code（APP_ERROR 以及依 AppError 類別命名的 code）：zh-TW 顯示原訊息，其他語系才用這張表
const COARSE_CODE_KEYS: Record<string, ServerErrorMessageKey> = {
  UNAUTHORIZED: "unauthorized",
  AUTH_UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  AUTH_FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  RESOURCE_NOT_FOUND: "not_found",
  USER_NOT_FOUND: "not_found",
  CONFLICT: "conflict",
  TOO_MANY_REQUESTS: "rate_limited",
};

// 400／422／5xx 不在表內：情境 fallback（「儲存失敗」）比「請求錯誤」有用
const STATUS_KEYS: Record<number, ServerErrorMessageKey> = {
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  410: "gone",
  413: "file_too_large",
  429: "rate_limited",
};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const normalizeDetails = (details: unknown): Record<string, string> | undefined => {
  if (Array.isArray(details)) {
    const entries = details.flatMap((d) => {
      const path = (d as { path?: unknown })?.path;
      const key = Array.isArray(path) ? path.join(".") : asString(path);
      const message = asString((d as { message?: unknown })?.message);
      return key && message ? [[key, message] as const] : [];
    });
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }
  if (details && typeof details === "object") {
    return details as Record<string, string>;
  }
  return undefined;
};

/**
 * 從 ApiError、openapi-fetch 的 error body（`{ error: { code, message, details } }`）、
 * 限流 body（`{ message, error: "RATE_LIMIT_EXCEEDED" }`）或一般 Error 取出錯誤資訊。
 */
export function parseServerError(error: unknown, status?: number): ParsedServerError {
  if (isApiError(error)) {
    const data = error.data as { code?: unknown; details?: unknown } | undefined;
    return {
      status: error.status,
      code: asString(data?.code),
      message: asString(error.message),
      details: normalizeDetails(data?.details),
    };
  }
  if (error instanceof Error) {
    return { status, code: undefined, message: asString(error.message), details: undefined };
  }
  if (!error || typeof error !== "object") return {};

  const outer = error as { error?: unknown; message?: unknown; code?: unknown; details?: unknown };
  if (outer.error && typeof outer.error === "object") {
    const inner = outer.error as { code?: unknown; message?: unknown; details?: unknown };
    return {
      status,
      code: asString(inner.code),
      message: asString(inner.message) ?? asString(outer.message),
      details: normalizeDetails(inner.details),
    };
  }
  return {
    status,
    code: asString(outer.code) ?? asString(outer.error),
    message: asString(outer.message),
    details: normalizeDetails(outer.details),
  };
}

export function resolveServerErrorMessage(
  error: unknown,
  options: ResolveServerErrorOptions
): string {
  const { locale, t, fallback, codeMessages, detailMessage } = options;
  const parsed = parseServerError(error, options.status);
  const status = parsed.status ?? options.status;
  const code = parsed.code;
  const isDefaultLocale = locale === routing.defaultLocale;

  const override = code ? codeMessages?.[code] : undefined;
  if (override) return override;

  const detail = asString(detailMessage);
  if (isDefaultLocale && detail) return detail;

  const codeKey = code ? CODE_KEYS[code] : undefined;
  if (codeKey) return t(codeKey);

  if (isDefaultLocale && parsed.message) return parsed.message;

  const coarseKey =
    (code ? COARSE_CODE_KEYS[code] : undefined) ?? (status ? STATUS_KEYS[status] : undefined);
  if (coarseKey) return t(coarseKey);

  return fallback ?? t("generic");
}

/**
 * 表單欄位層級的 server 訊息（validation details）：zh-TW 顯示原訊息，其他語系顯示「格式不正確」。
 */
export function resolveServerFieldMessage(
  message: string | undefined,
  { locale, t }: Pick<ResolveServerErrorOptions, "locale" | "t">
): string {
  const text = asString(message);
  return locale === routing.defaultLocale && text ? text : t("invalid_field");
}
