import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { SocialHub } from "@/components/social/social-hub";

export default async function SocialPage({ params }: PageProps<"/[locale]/social">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "social" });
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" title={t("page_title")} />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12">
        <SocialHub />
      </main>
    </div>
  );
}
