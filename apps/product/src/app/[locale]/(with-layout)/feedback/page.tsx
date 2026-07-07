"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export default function FeedbackPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title="回饋建議" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[128px] pt-3 md:pt-12">
        <FeedbackForm />
      </main>
    </div>
  );
}
