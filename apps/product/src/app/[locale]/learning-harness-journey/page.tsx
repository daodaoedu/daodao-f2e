"use client";

import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { BackgroundAnimation } from "@/components/layout";
import { HarnessJourney } from "@/components/learning-harness";

export default function LearningHarnessJourneyPage() {
  const t = useTranslations("learning_harness");
  const router = useRouter();

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
      <div className="sticky top-0 z-50 max-w-[448px] mx-auto w-full flex items-center px-2 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center size-10 rounded-full text-light-gray bg-very-light-gray/50 hover:text-logo-cyan"
          aria-label={t("growth_map_back")}
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-medium text-text-dark pr-10">
          {t("journey_title")}
        </h1>
      </div>

      <BackgroundAnimation />

      <main className="relative max-w-[448px] mx-auto px-5 pb-24 pt-2">
        <HarnessJourney />
      </main>
    </div>
  );
}
