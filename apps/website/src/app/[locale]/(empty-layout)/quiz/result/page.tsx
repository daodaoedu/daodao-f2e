import type { Metadata } from "next";
import { QuizResult } from "@daodao/features-quiz";

export const metadata: Metadata = {
  title: "測驗結果",
};

export default function QuizResultPage() {
  return <QuizResult />;
}
