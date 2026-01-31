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
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { initiateOAuthLogin } from "../lib/auth-client";

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

  const handleTermsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // 這裡可以打開服務條款頁面或 Dialog
    // 暫時先跳轉到服務條款頁面
    window.open("/terms/service", "_blank");
  };

  const handlePrivacyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // 這裡可以打開隱私權政策頁面或 Dialog
    // 暫時先跳轉到隱私權政策頁面
    window.open("/terms/privacy", "_blank");
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={`h-auto max-h-[calc(100vh-64px)] overflow-y-auto gap-0 ${className ?? ""}`}
        >
          <SheetHeader>
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
              <CustomLink
                href="/terms/service"
                onClick={handleTermsClick}
                className="text-logo-cyan underline underline-offset-2 hover:text-logo-cyan/80"
              >
                {t("login_dialog_terms_link")}
              </CustomLink>
              <span className="mx-1">{t("login_dialog_terms_and")}</span>
              <CustomLink
                href="/terms/privacy"
                onClick={handlePrivacyClick}
                className="text-logo-cyan underline underline-offset-2 hover:text-logo-cyan/80"
              >
                {t("login_dialog_privacy_link")}
              </CustomLink>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`w-fit sm:max-w-none overflow-hidden border-none ${className ?? ""}`}
        from="bottom"
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
              <CustomLink
                href="/terms/service"
                onClick={handleTermsClick}
                className="text-logo-cyan underline underline-offset-2 hover:text-logo-cyan/80"
              >
                {t("login_dialog_terms_link")}
              </CustomLink>
              <span className="mx-1">{t("login_dialog_terms_and")}</span>
              <CustomLink
                href="/terms/privacy"
                onClick={handlePrivacyClick}
                className="text-logo-cyan underline underline-offset-2 hover:text-logo-cyan/80"
              >
                {t("login_dialog_privacy_link")}
              </CustomLink>
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
