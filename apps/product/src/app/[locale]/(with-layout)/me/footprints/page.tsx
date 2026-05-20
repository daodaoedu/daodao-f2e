import { setRequestLocale } from "@daodao/i18n/server";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { FootprintsList } from "@/components/me/footprints-list";

export default async function FootprintsPage({ params }: PageProps<"/[locale]/me/footprints">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" title="學習足跡" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12">
        <FootprintsList />
      </main>
    </div>
  );
}
