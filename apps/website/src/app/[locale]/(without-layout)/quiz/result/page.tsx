import { QuizResult } from "@daodao/features-quiz";
import { setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "測驗結果",
};

export default async function QuizResultPage({ params }: PageProps<"/[locale]/quiz/result">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <QuizResult />;
}
