import { ActionMakerResult } from "@daodao/features-action-maker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "你的微習慣 | 建立微習慣",
  robots: "noindex",
};

export default function ResultPage() {
  return <ActionMakerResult />;
}
