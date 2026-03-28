import { ActionMakerTopic } from "@daodao/features-action-maker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "設定主題 | 建立微習慣",
  robots: "noindex",
};

export default function TopicPage() {
  return <ActionMakerTopic />;
}
