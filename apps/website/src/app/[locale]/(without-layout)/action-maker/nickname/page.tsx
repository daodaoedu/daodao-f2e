import { ActionMakerNickname } from "@daodao/features-action-maker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "輸入暱稱 | 建立微習慣",
  robots: "noindex",
};

export default function NicknamePage() {
  return <ActionMakerNickname />;
}
