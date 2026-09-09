"use client";

import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Heart, Users } from "lucide-react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";

const hubItems = [
  {
    id: "following",
    labelKey: "settings_following" as const,
    icon: Heart,
    href: "/settings/following",
  },
  {
    id: "connections",
    labelKey: "settings_connections" as const,
    icon: Users,
    href: "/settings/connections",
  },
];

export default function FollowHubPage() {
  const t = useTranslations("app_product");

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title={t("account_follow_hub")} />
      <BackgroundAnimation />
      <main className="max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12">
        <ul className="flex flex-col gap-2">
          {hubItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <CustomLink
                  href={item.href}
                  className="flex items-center gap-2 py-4 px-3 rounded bg-white hover:bg-light-blue transition-colors"
                >
                  <Icon className="size-4.5 text-light-gray shrink-0" />
                  <span className="flex-1 text-base text-text-dark">{t(item.labelKey)}</span>
                  <ArrowRightOutlineSvg className="size-4.5 text-bg-dark shrink-0" />
                </CustomLink>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
