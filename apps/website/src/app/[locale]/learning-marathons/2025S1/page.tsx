import type { Metadata } from "next";
import { Footer, HeaderNavbar } from "@/components/layout";
import { Marathon } from "@/components/learning-marathons";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "島島盃 - 2025 春季學習馬拉松",
  };
}

export default async function LearningMarathonsPage() {
  return (
    <>
      <HeaderNavbar />
      <main className="min-h-screen">
        <Marathon />
      </main>
      <Footer />
    </>
  );
}
