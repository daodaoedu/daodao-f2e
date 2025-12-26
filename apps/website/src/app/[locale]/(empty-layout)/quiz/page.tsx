import type { Metadata } from "next";
import { QuizIntro } from "@daodao/features-quiz";

export const metadata: Metadata = {
  title: "【我有一個島，它叫＿島】學習風格測驗",
  description:
    "島島阿學是為「相信學習可以不一樣的人」所打造的學習平台。以科技與社群，匯集學習經驗、資源、人脈，並提供個人化學習管理與技能展現的工具，賦予每個人掌握學習旅程的能力。",
};

export default function QuizPage() {
  return <QuizIntro />;
}
