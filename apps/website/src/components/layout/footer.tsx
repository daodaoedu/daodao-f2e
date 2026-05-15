"use client";

import { useTranslations } from "@daodao/i18n";
import { ANCHOR_IDS, SOCIAL_LINKS } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { LanguageSwitcher } from "@daodao/ui/components/language-switcher";
import { Check, ChevronRight } from "lucide-react";
import { useState } from "react";

type SubscribeStatus = "idle" | "loading" | "success" | "error";

export const Footer = () => {
  const t = useTranslations("common");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const formId = process.env.NEXT_PUBLIC_KIT_FORM_ID;
    if (!email || !formId) return;

    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("email_address", email);
      if (name) {
        formData.append("first_name", name);
      }

      const response = await fetch(`https://app.kit.com/forms/${formId}/subscriptions`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setStatus("success");
        setName("");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

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
                  href="/about"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_about_us")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`/about#${ANCHOR_IDS.VISION}`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_vision")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`/about#${ANCHOR_IDS.MISSION}`}
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
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/resource`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_learning_resources")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href="/learning-marathons/2025S1"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_learning_marathons")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href="/terms/privacy-policy"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_privacy_policy")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href="/terms/service"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_terms_of_service")}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href="/terms/ipr"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {t("footer_intellectual_property")}
                </CustomLink>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">{t("footer_newsletter_title")}</p>
            <form className="space-y-3" onSubmit={handleSubscribe}>
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-base disabled:opacity-50"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("footer_name_placeholder")}
                disabled={status === "loading" || status === "success"}
              />
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-base disabled:opacity-50"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer_email_placeholder")}
                disabled={status === "loading" || status === "success"}
                required
              />
              <Button
                type="submit"
                variant="ctaPrimary"
                size="huge"
                className="w-full"
                disabled={status === "loading" || status === "success" || !email}
              >
                {status === "loading" && t("footer_subscribing")}
                {status === "success" && (
                  <>
                    {t("footer_subscribed")}
                    <Check className="ml-2 size-5" />
                  </>
                )}
                {(status === "idle" || status === "error") && (
                  <>
                    {t("footer_subscribe_button")}
                    <ChevronRight className="ml-2 size-5" />
                  </>
                )}
              </Button>
              {status === "success" && (
                <p className="text-sm text-primary-lighter">{t("footer_subscribe_confirm_hint")}</p>
              )}
              {status === "error" && (
                <p className="text-sm text-red-400">{t("footer_subscribe_error")}</p>
              )}
            </form>
          </div>
        </div>
        <div className="mb-8 space-y-4">
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
            <CustomLink
              href={SOCIAL_LINKS.DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/assets/landing-page/icon-Discord.svg"
                alt={t("footer_discord_alt")}
                width={36}
                height={35}
              />
            </CustomLink>
          </div>
          <a
            href={`mailto:${SOCIAL_LINKS.CONTACT_EMAIL}`}
            className="text-white/70 transition-colors hover:text-primary-base"
          >
            {SOCIAL_LINKS.CONTACT_EMAIL}
          </a>
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
