"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { OnboardingForm } from "@/components/onboarding";
import { useAuth } from "@daodao/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Onboarding 頁面
 * 新用戶完成註冊後的引導流程
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  // 追蹤是否已經初始化過，避免 refreshAuth 導致組件重新掛載
  const [hasInitialized, setHasInitialized] = useState(false);

  // 處理初次載入邏輯：已登入則記錄狀態，未登入則重定向到首頁
  useEffect(() => {
    if (!isLoading && !hasInitialized) {
      if (isAuthenticated) {
        setHasInitialized(true);
      } else {
        router.replace("/");
      }
    }
  }, [isLoading, isAuthenticated, hasInitialized, router]);

  // 初次載入時顯示載入狀態（之後不再顯示，避免 OnboardingForm 被卸載）
  if (!hasInitialized && (isLoading || !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg text-text-dark">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction={null} rightActionTo="/" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[128px] pt-3 md:pt-12">
        <OnboardingForm initialEmail={user?.email || ""} />
      </main>
    </div>
  );
}
