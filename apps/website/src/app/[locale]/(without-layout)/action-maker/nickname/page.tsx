import { ActionMakerNickname } from "@daodao/features-action-maker";
import { setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "輸入暱稱 | 建立微習慣",
  robots: "noindex",
};

export default async function NicknamePage({
  params,
}: PageProps<"/[locale]/action-maker/nickname">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActionMakerNickname />;
}
