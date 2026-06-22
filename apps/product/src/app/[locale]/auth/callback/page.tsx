"use client";

import { useRedirectAfterLogin } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";

/**
 * OAuth Callback 頁面
 * 處理 OAuth 登入後的跳轉邏輯
 */
export default function AuthCallbackPage() {
  const t = useTranslations("app_product");
  useRedirectAfterLogin();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">{t("auth_callback_loading")}</div>
        <div className="text-sm text-gray-500">{t("auth_callback_redirecting")}</div>
      </div>
    </div>
  );
}
