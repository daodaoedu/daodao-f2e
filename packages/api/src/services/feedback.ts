/**
 * Feedback API Service
 * 設定頁「錯誤回報」表單：POST /api/v1/feedback/bug-report（multipart/form-data，最多 3 張截圖）
 *
 * 用 fetch + getApiBaseUrl() 而非 client：openapi-fetch 對 multipart 支援有限，且此端點尚未登記在 OpenAPI。
 * 不可改回相對路徑 `/api/...`——那會打到前端自己的 origin（daodao#166 dev 冒煙 J-07 的 404）。
 */

import { getApiBaseUrl, unauthorizedHandler } from "../client";
import { ApiError } from "../errors";

// 與 server src/validators/feedback.validator.ts 的 bugReportSchema.area enum 一致
export const BUG_REPORT_AREAS = ["ui", "performance", "auth", "data", "other"] as const;
export type BugReportArea = (typeof BUG_REPORT_AREAS)[number];

export interface SubmitBugReportInput {
  area: BugReportArea;
  description: string;
  link?: string;
  referrer?: string;
  userAgent?: string;
  screenshots?: File[];
}

export interface SubmitBugReportResult {
  /** 新回報的 id；server 回 2xx 但 body 無法解析時為 null（回報仍已送出） */
  id: number | null;
}

interface ServerErrorBody {
  error?: { code?: string; message?: string; details?: Record<string, string> };
}

const FALLBACK_ERROR_MESSAGE = "送出失敗";

export const submitBugReport = async (
  input: SubmitBugReportInput
): Promise<SubmitBugReportResult> => {
  const formData = new FormData();
  formData.append("area", input.area);
  formData.append("description", input.description);
  if (input.link) formData.append("link", input.link);
  if (input.referrer) formData.append("referrer", input.referrer);
  if (input.userAgent) formData.append("userAgent", input.userAgent);
  for (const file of input.screenshots ?? []) {
    formData.append("screenshots", file);
  }

  const response = await unauthorizedHandler.wrapFetch(
    `${getApiBaseUrl()}/api/v1/feedback/bug-report`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ServerErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error?.message || FALLBACK_ERROR_MESSAGE,
      body?.error as ConstructorParameters<typeof ApiError>[2]
    );
  }

  // 2xx 代表回報已寫入：body 空或不是 JSON 也視為成功（id 未知），不能讓使用者以為失敗而重送造成重複回報
  const body = (await response.json().catch(() => null)) as {
    data?: { id?: number } | null;
  } | null;
  return { id: typeof body?.data?.id === "number" ? body.data.id : null };
};
