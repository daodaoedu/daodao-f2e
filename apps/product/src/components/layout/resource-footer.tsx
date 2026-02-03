"use client";

import { useTranslations } from "@daodao/i18n";
import { ANCHOR_IDS, SOCIAL_LINKS } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { LanguageSwitcher } from "@daodao/ui/components/language-switcher";
import { ChevronRight } from "lucide-react";

export const ResourceFooter = () => {
  const t = useTranslations("common");

  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <footer className="bg-basic-600 pb-20 pt-12 text-white md:pb-12">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-start">
          <div>
            <Image
              src="/assets/landing-page/logo-simple-white.svg"
              alt="島島阿學 Logo"
              width={142}
              height={24}
              className="mb-2"
            />
            <p className="text-white/80">{t("footer_tagline")}</p>
          </div>

          {/* 語言切換元件 */}
          <div className="mt-2 md:mt-0">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">{t("footer_about_title")}</p>
            <div className="space-y-2">
              <div>
                <CustomLink
                  href={`${websiteUrl}/about`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_about_us")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`${websiteUrl}/about#${ANCHOR_IDS.VISION}`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_vision")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`${websiteUrl}/about#${ANCHOR_IDS.MISSION}`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_mission")}
                </CustomLink>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">{t("footer_resources_title")}</p>
            <div className="space-y-2">
              <div>
                <CustomLink
                  href={`${appUrl}/resource`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_learning_resources")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`${websiteUrl}/learning-marathons/2025S1`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_learning_marathons")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`${websiteUrl}/terms/privacy-policy`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_privacy_policy")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`${websiteUrl}/terms/service`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_terms_of_service")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`${websiteUrl}/terms/ipr`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_intellectual_property")}
                </CustomLink>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">{t("footer_newsletter_title")}</p>
            <form className="space-y-3">
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-base"
                type="email"
                placeholder={t("footer_email_placeholder")}
              />
              <Button type="submit" variant="ctaPrimary" size="huge" className="w-full">
                {t("footer_subscribe_button")}
                <ChevronRight className="ml-2 size-5" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mb-8 space-y-4">
          <p className="text-lg text-primary-lighter">{t("footer_social_title")}</p>
          <div className="flex gap-4">
            <CustomLink
              href={SOCIAL_LINKS.INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/assets/landing-page/icon-Instagram.svg"
                alt={t("footer_instagram_alt")}
                width={36}
                height={35}
              />
            </CustomLink>
            <CustomLink
              href={SOCIAL_LINKS.FACEBOOK}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/assets/landing-page/icon-Facebook.svg"
                alt={t("footer_facebook_alt")}
                width={36}
                height={35}
              />
            </CustomLink>
          </div>
        </div>
        <p className="text-center text-basic-300">
          {t("footer_copyright", {
            year: new Date().getFullYear(),
          })}
        </p>
      </div>
    </footer>
  );
};
