import { ActionMakerActions } from "@daodao/features-action-maker";
import { setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "行動建議 | 建立微習慣",
  robots: "noindex",
};

export default async function ActionsPage({ params }: PageProps<"/[locale]/action-maker/actions">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActionMakerActions />;
}
