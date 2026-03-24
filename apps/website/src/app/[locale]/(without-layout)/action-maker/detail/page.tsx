import { ActionMakerDetail } from "@daodao/features-action-maker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "行動細節 | 建立微習慣",
  robots: "noindex",
};

export default function DetailPage() {
  return <ActionMakerDetail />;
}
