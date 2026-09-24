import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import { PageShell } from "@/components/layout";
import { FootprintsPageContent } from "@/components/me/footprints-page-content";

export default async function FootprintsPage({ params }: PageProps<"/[locale]/me/footprints">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "app_product" });
  return (
    <PageShell
      headerProps={{ leftAction: "back", title: t("footprints_title") }}
      mainClassName="max-w-5xl"
    >
      <FootprintsPageContent />
    </PageShell>
  );
}
