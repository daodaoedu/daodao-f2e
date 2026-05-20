import { ActionMakerTopic } from "@daodao/features-action-maker";
import { setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "設定主題 | 建立微習慣",
  robots: "noindex",
};

export default async function TopicPage({ params }: PageProps<"/[locale]/action-maker/topic">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActionMakerTopic />;
}
