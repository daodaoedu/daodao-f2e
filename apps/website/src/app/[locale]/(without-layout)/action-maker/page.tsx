import { ActionMakerIntro } from "@daodao/features-action-maker";
import { setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "建立微習慣，抓住你的星",
  description: "總是覺得規劃新年目標很難嗎？我們陪你一步一步建立小習慣，每天都比昨天更進步一些。",
};

export default async function ActionMakerPage({ params }: PageProps<"/[locale]/action-maker">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActionMakerIntro />;
}
