import { ActionMakerDetail } from "@daodao/features-action-maker";
import { setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "行動細節 | 建立微習慣",
  robots: "noindex",
};

export default async function DetailPage({ params }: PageProps<"/[locale]/action-maker/detail">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActionMakerDetail />;
}
