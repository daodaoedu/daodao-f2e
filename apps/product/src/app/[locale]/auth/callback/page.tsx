"use client";

import { useRedirectAfterLogin } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";

/**
 * OAuth Callback 頁面
 * 處理 OAuth 登入後的跳轉邏輯
 */
export default function AuthCallbackPage() {
  useRedirectAfterLogin();
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">{t("callback_processing")}</div>
        <div className="text-sm text-gray-500">{t("please_wait_redirect")}</div>
      </div>
    </div>
  );
}
