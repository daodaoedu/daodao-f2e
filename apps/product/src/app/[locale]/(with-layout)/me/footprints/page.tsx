import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { FootprintsPageContent } from "@/components/me/footprints-page-content";

export default async function FootprintsPage({ params }: PageProps<"/[locale]/me/footprints">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "app_product" });
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" title={t("footprints_title")} />

      <BackgroundAnimation />

      <main className="mx-auto max-w-5xl px-5 pb-[64px] pt-3 md:pt-12">
        <FootprintsPageContent />
      </main>
    </div>
  );
}
