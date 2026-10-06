import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import { PageShell } from "@/components/layout";
import { SocialHub } from "@/components/social/social-hub";

export default async function SocialPage({ params }: PageProps<"/[locale]/social">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "app_product" });
  return (
    <PageShell headerProps={{ leftAction: "back", title: t("social_title") }}>
      <SocialHub />
    </PageShell>
  );
}
