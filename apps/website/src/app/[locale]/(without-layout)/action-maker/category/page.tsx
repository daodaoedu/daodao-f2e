import { ActionMakerCategory } from "@daodao/features-action-maker";
import { setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "選擇分類 | 建立微習慣",
  robots: "noindex",
};

export default async function CategoryPage({
  params,
}: PageProps<"/[locale]/action-maker/category">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActionMakerCategory />;
}
