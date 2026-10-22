"use client";

import { useCallback } from "react";
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";
import { apiErrorMessage } from "@/utils/cohort-api-error";

/**
 * 燈塔頁面的 API 錯誤 toast 文字：zh-TW 沿用 apiErrorMessage 挑出的 server 訊息（第一條欄位訊息優先），
 * 其他語系不顯示 server 原文，改走共用的 code／status 轉換（daodao#353）。
 * 呼叫方式與 apiErrorMessage(error, fallback) 相同。
 */
export function useLighthouseErrorMessage() {
  const { errorMessage } = useServerErrorMessage();
  return useCallback(
    (error: unknown, fallback: string) =>
      errorMessage(error, fallback, { detailMessage: apiErrorMessage(error, fallback) }),
    [errorMessage]
  );
}
