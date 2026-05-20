"use client";

import { useUsers } from "@daodao/api";
import cooporationImg from "@daodao/assets/images/landing-page/cooporation.png";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { ANCHOR_IDS } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";

export function CommunitySection() {
  const { openLoginDialog } = useAuth();
  const { data: usersData } = useUsers({ page: 1, pageSize: 1 });
  const userCount = usersData?.pagination?.totalItems ?? 0;
  const t = useTranslations("landing_page");

  return (
    <section id={ANCHOR_IDS.COMMUNITY} className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-lg rounded-2xl border-2 border-primary-base bg-primary-base/5 px-6 py-10 text-center">
          {/* 標題 */}
          <h2 className="text-[1.75rem] font-bold leading-tight">
            <span className="text-primary-base">{t("community_title_join")}</span>
            <span className="text-primary-darker">{t("community_title_discuss")}</span>
          </h2>

          {/* 副標題 */}
          <p className="mt-4 text-sm leading-relaxed text-basic-400">
            {t("community_subtitle_line1")}
            <br />
            {t("community_subtitle_line2")}
            <br />
            {t("community_subtitle_line3")}
          </p>

          {/* 插圖 */}
          <div className="relative mx-auto my-8 aspect-[4/3] w-full max-w-sm">
            <Image src={cooporationImg} alt={t("community_image_alt")} fill className="object-contain" />
          </div>

          {/* 統計數字 */}
          <p className="mb-4 text-lg">
            <span className="text-2xl font-bold text-primary-base">{userCount}</span>
            <span className="text-primary-darker">{t("community_user_count_suffix")}</span>
          </p>

          {/* CTA 按鈕 */}
          <Button
            variant="ctaOrange"
            size="huge"
            onClick={() => openLoginDialog({ redirectUrl: "/" })}
          >
            {t("community_cta_button")}
          </Button>

          {/* 說明文字 */}
          <p className="mt-4 text-[13px] text-basic-300">{t("community_cta_note")}</p>
        </div>
      </div>
    </section>
  );
}
