import { ActionMakerActions } from "@daodao/features-action-maker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "行動建議 | 建立微習慣",
  robots: "noindex",
};

export default function ActionsPage() {
  return <ActionMakerActions />;
}
