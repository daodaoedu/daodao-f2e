"use client";

import { useLocale, useTranslations } from "@daodao/i18n";
import { useCallback } from "react";
import {
  type ResolveServerErrorOptions,
  resolveServerErrorMessage,
  resolveServerFieldMessage,
  type ServerErrorMessageKey,
} from "./server-error-message";

type ErrorMessageOptions = Pick<
  ResolveServerErrorOptions,
  "status" | "codeMessages" | "detailMessage"
>;

/**
 * 元件裡顯示 API 錯誤用這個，不要直接顯示 server 的 message（server 只回中文，見 daodao#353）。
 *
 * const { errorMessage, fieldMessage } = useServerErrorMessage();
 * toast.error(errorMessage(response.error, t("save_failed"), { status: response.response.status }));
 */
export function useServerErrorMessage() {
  const locale = useLocale();
  const tServerError = useTranslations("common.server_error");
  const t = useCallback((key: ServerErrorMessageKey) => tServerError(key), [tServerError]);

  const errorMessage = useCallback(
    (error: unknown, fallback?: string, options?: ErrorMessageOptions) =>
      resolveServerErrorMessage(error, { locale, t, fallback, ...options }),
    [locale, t]
  );

  const fieldMessage = useCallback(
    (message: string | undefined) => resolveServerFieldMessage(message, { locale, t }),
    [locale, t]
  );

  return { errorMessage, fieldMessage, locale, t };
}

export type ServerErrorMessageFn = ReturnType<typeof useServerErrorMessage>["errorMessage"];
