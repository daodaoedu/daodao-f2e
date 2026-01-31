import { QuizResult } from "@daodao/features-quiz";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "測驗結果",
};

export default function QuizResultPage() {
  return <QuizResult />;
}
