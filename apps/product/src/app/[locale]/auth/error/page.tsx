"use client";

import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BackgroundAnimation, PageHeader } from "@/components/layout";

type OAuthErrorReason =
  | "state_expired"
  | "invalid_state"
  | "invalid_redirect_uri"
  | "server_error";

/**
 * OAuth 登入錯誤頁面
 * 當後端 OAuth 流程驗證失敗時，重定向到此頁面顯示友善錯誤訊息
 */
export default function AuthErrorPage() {
  const t = useTranslations("auth.oauthError");
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") as OAuthErrorReason | null;
  const { openLoginDialog } = useAuth();

  const getContent = () => {
    switch (reason) {
      case "state_expired":
        return {
          title: t("stateExpired.title"),
          description: t("stateExpired.description"),
        };
      case "invalid_state":
        return {
          title: t("invalidState.title"),
          description: t("invalidState.description"),
        };
      case "invalid_redirect_uri":
        return {
          title: t("invalidRedirectUri.title"),
          description: t("invalidRedirectUri.description"),
        };
      case "server_error":
        return {
          title: t("serverError.title"),
          description: t("serverError.description"),
        };
      default:
        return {
          title: t("unknown.title"),
          description: t("unknown.description"),
        };
    }
  };

  const { title, description } = getContent();
  const canRetry = reason !== "invalid_redirect_uri";

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction={null} rightActionTo="/" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[128px] pt-12 md:pt-24">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-text-dark">{title}</h1>

          <p className="text-text-gray">{description}</p>

          <div className="flex flex-col gap-3 w-full mt-8">
            {canRetry && (
              <Button
                variant="orange"
                className="w-full"
                onClick={() => openLoginDialog()}
              >
                {t("actions.retry")}
              </Button>
            )}

            <Button variant="ghost" className="w-full" asChild>
              <Link href="/">{t("actions.backToHome")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
