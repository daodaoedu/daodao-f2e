"use client";

import { resendVerificationEmail } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Mail, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Email 驗證等待頁面
 * 用戶未驗證 email 時會被重定向到這個頁面
 */
export default function VerifyEmailPendingPage() {
  const t = useTranslations("auth.verifyEmail.pending");
  const router = useRouter();
  const { user, isAuthenticated, isEmailVerified, logout, refreshAuth } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // 只有當用戶已登入且 email 已驗證時，才跳轉到首頁
  // 未認證用戶可以直接瀏覽此公開頁面
  useEffect(() => {
    if (isAuthenticated && isEmailVerified) {
      router.replace("/");
    }
  }, [isAuthenticated, isEmailVerified, router]);

  // 定期檢查 email 驗證狀態
  useEffect(() => {
    const checkInterval = setInterval(() => {
      refreshAuth();
    }, 5000); // 每 5 秒檢查一次

    return () => clearInterval(checkInterval);
  }, [refreshAuth]);

  // 冷卻計時器
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleResendVerification = useCallback(async () => {
    if (!user?.email || isResending || cooldownSeconds > 0) {
      return;
    }

    setIsResending(true);
    try {
      const response = await resendVerificationEmail({ email: user.email });
      if (response.data?.success) {
        toast.success(t("resendSuccess"));
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      } else {
        toast.error(t("resendFailed"));
      }
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast.error(t("resendFailed"));
    } finally {
      setIsResending(false);
    }
  }, [user?.email, isResending, cooldownSeconds, t]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/");
  }, [logout, router]);

  const description = user?.email
    ? t("description", { email: user.email })
    : t("descriptionNoEmail");

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction={null} />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[128px] pt-12 md:pt-24">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-orange-100">
            <Mail className="w-10 h-10 text-orange-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-text-dark">{t("title")}</h1>

          {/* Description */}
          <p className="text-text-gray">{description}</p>

          {/* Check spam hint */}
          <p className="text-sm text-text-gray">{t("checkSpam")}</p>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full mt-8">
            <Button
              variant="orange"
              className="w-full"
              onClick={handleResendVerification}
              disabled={isResending || cooldownSeconds > 0}
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t("resending")}
                </>
              ) : cooldownSeconds > 0 ? (
                t("resendCooldown", { seconds: cooldownSeconds })
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t("resendButton")}
                </>
              )}
            </Button>

            <Button variant="ghost" className="w-full" onClick={handleLogout}>
              {t("logout")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
