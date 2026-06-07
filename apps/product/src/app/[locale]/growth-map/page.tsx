"use client";

import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { BackgroundAnimation } from "@/components/layout";
import { GrowthMap } from "@/components/learning-harness";

export default function GrowthMapPage() {
  const t = useTranslations("learning_harness");
  const router = useRouter();

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
      <div className="sticky top-0 z-50 max-w-[448px] mx-auto w-full">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-2 left-2 flex items-center justify-center size-10 rounded-full text-light-gray bg-very-light-gray/50 hover:text-logo-cyan"
          aria-label={t("growth_map_back")}
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-center py-3 text-base font-medium text-text-dark">
          {t("growth_map_title")}
        </h1>
      </div>

      <BackgroundAnimation />

      <main className="relative max-w-[448px] mx-auto px-5 pb-24 pt-2">
        <GrowthMap />
      </main>
    </div>
  );
}
