"use client";

import { useAuth } from "@daodao/auth";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * 登入頁面
 * 自動打開登入 Dialog，並處理 redirect 參數
 */
export default function LoginPage() {
  const { openLoginDialog } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 從 URL 參數中取得 redirect URL
    const redirectUrl = searchParams.get("redirect") || undefined;
    // 打開登入 Dialog，強制不可關閉
    openLoginDialog({ redirectUrl, source: "app", dismissible: false });
  }, [searchParams, openLoginDialog]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">正在開啟登入...</div>
        <div className="text-sm text-gray-500">請稍候</div>
      </div>
    </div>
  );
}
