"use client";

import { useAuth } from "@daodao/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * 登入頁面
 * 自動打開登入 Dialog，並處理 redirect 參數
 */
export default function LoginPage() {
  const { openLoginDialog, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // 從 URL 參數中取得 redirect URL
    const redirectUrl = searchParams.get("redirect") || undefined;
    // 打開登入 Dialog，強制不可關閉
    openLoginDialog({ redirectUrl, source: "app", dismissible: false });
  }, [searchParams, openLoginDialog]);

  // Android Chrome Custom Tab 場景：CCT 完成 OAuth 後主 tab 會觸發 checkAuth()
  // 認證成功後跳轉到目標頁面
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    }
  }, [isLoading, isAuthenticated, searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">正在開啟登入...</div>
        <div className="text-sm text-gray-500">請稍候</div>
      </div>
    </div>
  );
}
