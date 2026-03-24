import { ActionMakerCategory } from "@daodao/features-action-maker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "選擇分類 | 建立微習慣",
  robots: "noindex",
};

export default function CategoryPage() {
  return <ActionMakerCategory />;
}
