"use client";

import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { PersonaTab } from "@/components/persona";
import { HOME_TAB_PATHS } from "@/constants/home-navigation";

export default function PersonaPage() {
  const router = useRouter();
  const t = useTranslations("dashboard");

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />
      <main className="relative z-[25] pb-[72px] bg-very-light-gray">
        <div className="max-w-[640px] px-4 mx-auto pt-4">
          <div className="flex border-b border-[#E5E7EB] mb-4">
            <button
              type="button"
              onClick={() => router.replace(HOME_TAB_PATHS.inspire)}
              className={cn("flex-1 py-2 text-sm font-medium transition-all", "text-text-dark/40")}
            >
              {t("tab_inspire")}
            </button>
            <button
              type="button"
              onClick={() => router.replace(HOME_TAB_PATHS.mine)}
              className={cn("flex-1 py-2 text-sm font-medium transition-all", "text-text-dark/40")}
            >
              {t("tab_mine")}
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                "text-text-dark border-b-2 border-logo-cyan -mb-px"
              )}
            >
              {t("tab_persona")}
            </button>
          </div>
          <PersonaTab />
        </div>
      </main>
    </div>
  );
}
