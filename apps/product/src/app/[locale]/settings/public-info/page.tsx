"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { PublicInfoForm } from "@/components/settings/public-info";

export default function PublicInfoSettingsPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" title="公開資訊設定" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[128px] pt-3 md:pt-12">
        <PublicInfoForm />
      </main>
    </div>
  );
}
