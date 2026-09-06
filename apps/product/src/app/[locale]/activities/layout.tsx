import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "explore_activities" });
  return {
    title: t("meta_title"),
    description: t("page_subtitle"),
  };
}

export default async function ActivitiesLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <>{children}</>;
}
