"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { ArchivedContentList } from "@/components/settings/archived-content-list";

export default function ArchivedContentPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title="已封存的內容" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12">
        <ArchivedContentList />
      </main>
    </div>
  );
}
