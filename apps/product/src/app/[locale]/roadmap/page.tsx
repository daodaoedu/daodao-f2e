import { getRoadmapItems, getRoadmapStats } from "@daodao/api";
import daodaoLogo from "@daodao/assets/images/brand/daodao-logo.webp";
import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";
import { Suspense } from "react";
import { RoadmapBoard } from "@/components/roadmap";

interface RoadmapPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: RoadmapPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "roadmap" });
  const title = t("meta_title");
  const description = t("meta_description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: daodaoLogo.src }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [daodaoLogo.src],
    },
  };
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 首屏由 server 取看板 + 統計（利於 SEO 與分享預覽）；API 不可用時降級為空看板
  const [itemsRes, statsRes] = await Promise.allSettled([
    getRoadmapItems({ status: "all", limit: 20 }),
    getRoadmapStats(),
  ]);

  if (itemsRes.status === "rejected") {
    console.error("Failed to fetch roadmap items on server:", itemsRes.reason);
  } else if (itemsRes.value.error) {
    console.error("Roadmap items API returned error on server:", itemsRes.value.error);
  }

  if (statsRes.status === "rejected") {
    console.error("Failed to fetch roadmap stats on server:", statsRes.reason);
  } else if (statsRes.value.error) {
    console.error("Roadmap stats API returned error on server:", statsRes.value.error);
  }

  const initialItems = itemsRes.status === "fulfilled" ? (itemsRes.value.data?.data ?? []) : [];
  const initialNextCursor =
    itemsRes.status === "fulfilled" ? (itemsRes.value.data?.pagination?.nextCursor ?? null) : null;
  const initialStats = statsRes.status === "fulfilled" ? (statsRes.value.data?.data ?? null) : null;

  return (
    <Suspense fallback={null}>
      <RoadmapBoard
        initialStats={initialStats}
        initialItems={initialItems}
        initialNextCursor={initialNextCursor}
      />
    </Suspense>
  );
}
