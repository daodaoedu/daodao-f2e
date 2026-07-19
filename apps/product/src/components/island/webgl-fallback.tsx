"use client";

import userDesktopBannerPng from "@daodao/assets/images/users/user-desktop-banner.png";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";

/**
 * WebGL 不可用的 2D fallback（task 4.4，spec「WebGL 失敗降級」）：
 * 島嶼插畫＋返回個人頁連結，不白屏、不阻斷其他功能
 */
export function WebglFallback({ identifier }: { identifier: string }) {
  const t = useTranslations("island");
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#F3FCFC] to-[#A9EDE8] px-6 text-center">
      <div className="relative w-full max-w-[480px] aspect-[2/1] overflow-hidden rounded-3xl">
        <Image
          src={userDesktopBannerPng}
          alt={t("webgl_fallback_title")}
          fill
          className="object-cover"
        />
      </div>
      <h1 className="text-lg font-medium text-text-dark">{t("webgl_fallback_title")}</h1>
      <p className="text-sm text-text-dark/70">{t("webgl_fallback_desc")}</p>
      <Button variant="orange" asChild>
        <Link href={`/users/${identifier}`}>{t("back_to_profile")}</Link>
      </Button>
    </div>
  );
}
