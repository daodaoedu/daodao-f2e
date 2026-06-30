import { QuizIntro } from "@daodao/features-quiz";
import { setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "【我有一個島，它叫＿島】學習風格測驗",
  description:
    "島島阿學是為「相信學習可以不一樣的人」所打造的學習平台。以科技與社群，匯集學習經驗、資源、人脈，並提供個人化學習管理與技能展現的工具，賦予每個人掌握學習旅程的能力。",
};

export default async function QuizPage({ params }: PageProps<"/[locale]/quiz">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <QuizIntro />;
}
