"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { resendVerificationEmail } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { CheckCircle, Mail, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type VerificationStatus = "success" | "error";
type VerificationMessage =
  | "verified"
  | "already_verified"
  | "missing_token"
  | "invalid_token"
  | "user_not_found"
  | "verification_failed"
  | "unknown_error";

interface VerificationResult {
  type: "success" | "error";
  title: string;
  description: string;
}

/**
 * 郵件驗證結果頁面
 * 用戶點擊郵件中的驗證連結後，後端會重定向到這個頁面
 */
export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") as VerificationStatus | null;
  const message = searchParams.get("message") as VerificationMessage | null;
  const email = searchParams.get("email");

  const [isResending, setIsResending] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // 驗證成功後，先刷新認證狀態再導航到首頁
  const handleGoToHome = useCallback(async () => {
    setIsNavigating(true);
    try {
      // 先刷新認證狀態，確保 isEmailVerified 更新
      await refreshAuth();
      router.push("/");
    } catch (error) {
      console.error("Failed to refresh auth:", error);
      router.push("/");
    }
  }, [refreshAuth, router]);

  const getResult = (): VerificationResult => {
    if (status === "success") {
      switch (message) {
        case "verified":
          return {
            type: "success",
            title: t("success.verified.title"),
            description: t("success.verified.description"),
          };
        case "already_verified":
          return {
            type: "success",
            title: t("success.alreadyVerified.title"),
            description: t("success.alreadyVerified.description"),
          };
        default:
          return {
            type: "success",
            title: t("success.default.title"),
            description: t("success.default.description"),
          };
      }
    } else {
      switch (message) {
        case "missing_token":
          return {
            type: "error",
            title: t("error.missingToken.title"),
            description: t("error.missingToken.description"),
          };
        case "invalid_token":
          return {
            type: "error",
            title: t("error.invalidToken.title"),
            description: t("error.invalidToken.description"),
          };
        case "user_not_found":
          return {
            type: "error",
            title: t("error.userNotFound.title"),
            description: t("error.userNotFound.description"),
          };
        case "verification_failed":
          return {
            type: "error",
            title: t("error.verificationFailed.title"),
            description: t("error.verificationFailed.description"),
          };
        default:
          return {
            type: "error",
            title: t("error.unknown.title"),
            description: t("error.unknown.description"),
          };
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error(t("resend.noEmail"));
      return;
    }

    setIsResending(true);
    try {
      const response = await resendVerificationEmail({ email });
      if (response.data?.success) {
        toast.success(t("resend.success"));
      } else {
        toast.error(t("resend.failed"));
      }
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast.error(t("resend.failed"));
    } finally {
      setIsResending(false);
    }
  };

  const result = getResult();
  const isSuccess = result.type === "success";
  const showResendButton = status === "error" && message === "invalid_token" && email;

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction={null} rightActionTo="/" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[128px] pt-12 md:pt-24">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isSuccess ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-text-dark">{result.title}</h1>

          {/* Description */}
          <p className="text-text-gray">{result.description}</p>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full mt-8">
            {isSuccess && (
              <Button
                variant="orange"
                className="w-full"
                onClick={handleGoToHome}
                disabled={isNavigating}
              >
                {isNavigating ? "..." : t("actions.goToHome")}
              </Button>
            )}

            {showResendButton && (
              <Button
                variant="orange"
                className="w-full"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isResending ? t("resend.sending") : t("resend.button")}
              </Button>
            )}

            {!isSuccess && (
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/">{t("actions.backToHome")}</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
