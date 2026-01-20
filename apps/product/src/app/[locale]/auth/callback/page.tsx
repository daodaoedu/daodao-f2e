"use client";

import { useRedirectAfterLogin } from "@daodao/auth";

/**
 * OAuth Callback 頁面
 * 處理 OAuth 登入後的跳轉邏輯
 */
export default function AuthCallbackPage() {
  useRedirectAfterLogin();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">正在處理登入...</div>
        <div className="text-sm text-gray-500">請稍候，即將跳轉</div>
      </div>
    </div>
  );
}
