"use client";

import { useCallback } from "react";
import { splitApiResult } from "@/lib/server-error/server-error-message";
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";
import { apiErrorMessage } from "@/utils/cohort-api-error";

/**
 * 燈塔頁面的 API 錯誤 toast 文字：zh-TW 沿用 apiErrorMessage 挑出的 server 訊息（第一條欄位訊息優先），
 * 其他語系不顯示 server 原文，改走共用的 code／status 轉換（daodao#353）。
 * 傳 openapi-fetch 的整個回傳值（`{ error, response }`）才拿得到 HTTP status；
 * server 業務錯誤都是 APP_ERROR，沒有 status 時英文介面只能顯示情境 fallback。
 */
export function useLighthouseErrorMessage() {
  const { errorMessage } = useServerErrorMessage();
  return useCallback(
    (errorOrResult: unknown, fallback: string) => {
      const { error, status } = splitApiResult(errorOrResult);
      return errorMessage(error, fallback, {
        status,
        detailMessage: apiErrorMessage(error, fallback),
      });
    },
    [errorMessage]
  );
}
