"use client";

import { GoogleFilledSvg } from "@daodao/assets";
import desktopLoginPng from "@daodao/assets/images/login/desktop-login.png";
import mobileLoginPng from "@daodao/assets/images/login/mobile-login.png";
import { useTranslations } from "@daodao/i18n";
import { useIsMobile } from "@daodao/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { getEnv } from "@daodao/config";
import { initiateOAuthLogin } from "../lib/auth-client";

const websiteUrl = getEnv("NEXT_PUBLIC_WEBSITE_URL", "");

export interface LoginDialogProps {
  /** 是否開啟 Dialog */
  open: boolean;
  /** Dialog 關閉回調 */
  onOpenChange: (open: boolean) => void;
  /** 登入後要跳轉的 URL */
  redirectUrl?: string;
  /** 來源網站 */
  source?: "website" | "app";
  /** 自訂 className */
  className?: string;
  /** 自訂登入處理函數（如果提供，會覆蓋預設行為） */
  onLogin?: () => void;
  /** 是否允許關閉（預設: true） */
  dismissible?: boolean;
}

/**
 * 登入 Dialog 元件
 * 提供 Google OAuth 登入功能，採用左右分欄設計
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <LoginDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   redirectUrl="/dashboard"
 * />
 * ```
 */
export const LoginDialog = ({
  open,
  onOpenChange,
  redirectUrl,
  source,
  className,
  onLogin,
  dismissible = true,
}: LoginDialogProps) => {
  const t = useTranslations("auth");
  const isMobile = useIsMobile();

  const handleGoogleLogin = () => {
    if (onLogin) {
      onLogin();
      return;
    }
    const defaultSource = source || (window.location.hostname.includes("app.") ? "app" : "website");
    initiateOAuthLogin(redirectUrl, defaultSource);
  };


  // 處理關閉事件（如果不可關閉，則阻止關閉）
  const handleOpenChange = (newOpen: boolean) => {
    if (!dismissible && !newOpen) {
      // 如果不可關閉且嘗試關閉，則不執行任何操作
      return;
    }
    onOpenChange(newOpen);
  };

  // 阻止點擊外部關閉
  const handlePointerDownOutside = (e: { preventDefault: () => void }) => {
    if (!dismissible) {
      e.preventDefault();
    }
  };

  // 阻止 ESC 鍵關閉
  const handleEscapeKeyDown = (e: { preventDefault: () => void }) => {
    if (!dismissible) {
      e.preventDefault();
    }
  };

  // 阻止交互外部關閉
  const handleInteractOutside = (e: { preventDefault: () => void }) => {
    if (!dismissible) {
      e.preventDefault();
    }
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          className={`h-auto max-h-[calc(100vh-64px)] overflow-y-auto gap-0 ${className ?? ""}`}
          onPointerDownOutside={handlePointerDownOutside}
          onInteractOutside={handleInteractOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <SheetHeader showCloseButton={dismissible}>
            <SheetTitle className="text-3xl font-medium text-bg-dark mb-2 mt-10">
              {t("login_dialog_title")}
            </SheetTitle>
            <SheetDescription className="text-base text-center text-text-dark">
              {t("login_dialog_subtitle")}
            </SheetDescription>
          </SheetHeader>

          <div className="px-5 pt-8 flex flex-col gap-8">
            <Button
              type="button"
              variant="white"
              onClick={handleGoogleLogin}
              className="border border-light-gray w-full"
              aria-label={t("login_dialog_google_button_label")}
            >
              <GoogleFilledSvg className="size-5 shrink-0" />
              <span className="text-base font-medium text-text-dark">
                {t("login_dialog_google_button_text")}
              </span>
            </Button>

            {/* 服務條款連結 */}
            <div className="text-sm text-text-dark text-center">
              <span>{t("login_dialog_terms_prefix")}</span>
              <br />
              <a
                href={`${websiteUrl}/terms/service`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-logo-cyan underline underline-offset-2 hover:text-logo-cyan/80"
              >
                {t("login_dialog_terms_link")}
              </a>
              <span className="mx-1">{t("login_dialog_terms_and")}</span>
              <a
                href={`${websiteUrl}/terms/privacy-policy`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-logo-cyan underline underline-offset-2 hover:text-logo-cyan/80"
              >
                {t("login_dialog_privacy_link")}
              </a>
            </div>
          </div>
          <div className="relative w-full h-[290px]">
            <Image
              src={mobileLoginPng}
              alt="Mobile Login"
              fill
              className="object-cover object-bottom"
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`w-fit sm:max-w-none overflow-hidden border-none ${className ?? ""}`}
        from="bottom"
        showCloseButton={dismissible}
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <div className="flex">
          <div className="w-[372px] pt-16 pb-8 px-8 flex flex-col justify-between">
            <div>
              <DialogHeader className="w-full mb-10 pt-0">
                <DialogTitle className="text-3xl text-left font-medium text-bg-dark mb-2">
                  {t("login_dialog_title")}
                </DialogTitle>
                <DialogDescription className="text-base text-left text-text-dark">
                  {t("login_dialog_subtitle")}
                </DialogDescription>
              </DialogHeader>

              <Button
                type="button"
                variant="white"
                onClick={handleGoogleLogin}
                className="border border-light-gray w-full"
                aria-label={t("login_dialog_google_button_label")}
              >
                <GoogleFilledSvg className="size-5 shrink-0" />
                <span className="text-base font-medium text-text-dark">
                  {t("login_dialog_google_button_text")}
                </span>
              </Button>
            </div>

            {/* 服務條款連結 */}
            <div className="text-sm text-text-dark">
              <span>{t("login_dialog_terms_prefix")}</span>
              <br />
              <a
                href={`${websiteUrl}/terms/service`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-logo-cyan underline underline-offset-2 hover:text-logo-cyan/80"
              >
                {t("login_dialog_terms_link")}
              </a>
              <span className="mx-1">{t("login_dialog_terms_and")}</span>
              <a
                href={`${websiteUrl}/terms/privacy-policy`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-logo-cyan underline underline-offset-2 hover:text-logo-cyan/80"
              >
                {t("login_dialog_privacy_link")}
              </a>
            </div>
          </div>

          <div className="relative w-[268px] h-[440px]">
            <Image src={desktopLoginPng} alt="Desktop Login" fill className="object-cover" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
