import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { SocialHub } from "@/components/social/social-hub";

export default function SocialPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" title="社交" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12">
        <SocialHub />
      </main>
    </div>
  );
}
