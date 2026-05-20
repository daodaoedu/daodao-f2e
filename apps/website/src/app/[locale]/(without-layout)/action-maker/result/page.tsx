import { ActionMakerResult } from "@daodao/features-action-maker";
import { setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "你的微習慣 | 建立微習慣",
  robots: "noindex",
};

export default async function ResultPage({ params }: PageProps<"/[locale]/action-maker/result">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActionMakerResult />;
}
