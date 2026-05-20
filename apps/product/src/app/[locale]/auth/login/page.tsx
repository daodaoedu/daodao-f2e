"use client";

import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * 登入頁面
 * 自動打開登入 Dialog，並處理 redirect 參數
 */
export default function LoginPage() {
  const { openLoginDialog, isAuthenticated, isLoading } = useAuth();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();

  useEffect(() => {
    // 從 URL 參數中取得 redirect URL
    const redirectUrl = searchParams.get("redirect") || undefined;
    // 打開登入 Dialog，強制不可關閉
    openLoginDialog({ redirectUrl, source: "app", dismissible: false });
  }, [searchParams, openLoginDialog]);

  // Android Chrome Custom Tab 場景：CCT 完成 OAuth 後主 tab 會觸發 checkAuth()
  // 認證成功後跳轉到目標頁面
  //
  // 使用 window.location.href 整頁重新載入而非 router.push：
  // - 確保 AuthProvider 重 mount，checkAuth 在新 session cookie 就緒後重跑，
  //   避免目標頁面在 isAuthenticated 還沒翻成 true 前就觸發路由保護踢回登入頁形成循環
  // - 避開 next/navigation 的 router.push 不帶 locale prefix 在 next-intl 下的不一致行為
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectUrl = searchParams.get("redirect") || "/";
      window.location.href = redirectUrl;
    }
  }, [isLoading, isAuthenticated, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">{t("login_processing")}</div>
        <div className="text-sm text-gray-500">{t("please_wait")}</div>
      </div>
    </div>
  );
}
