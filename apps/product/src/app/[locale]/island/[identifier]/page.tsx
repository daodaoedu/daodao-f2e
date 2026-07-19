import { getUserIsland } from "@daodao/api";
import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { IslandError, IslandPageClient } from "@/components/island";

/**
 * 3D 島嶼頁（openspec change: island-3d, task 4.1）
 *
 * 全螢幕、位於 (with-layout) 之外（無 Sidebar/Footer）。
 * Server component 於 SSR 撈 islandData（手動轉發 auth_token cookie
 * 以計算 viewerRelation 與隱私過濾），three.js 引擎由 client 殼
 * dynamic import（ssr: false）——不進主站 bundle。
 */

// SSR 需手動轉發 auth_token cookie，否則訪客/島主判斷會失效
const getCachedUserIsland = cache(async (identifier: string, authToken: string) => {
  try {
    return await getUserIsland(
      identifier,
      authToken ? { Cookie: `auth_token=${authToken}` } : undefined
    );
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/island/[identifier]">): Promise<Metadata> {
  const { identifier, locale } = await params;
  const t = await getTranslations({ locale, namespace: "island" });

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value ?? "";
  const response = await getCachedUserIsland(identifier, authToken);
  const name = response?.data?.data?.profile?.name;

  return {
    title: name ? t("meta_title", { name }) : t("meta_title_default"),
  };
}

export default async function IslandPage({ params }: PageProps<"/[locale]/island/[identifier]">) {
  const { identifier, locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value ?? "";
  const response = await getCachedUserIsland(identifier, authToken);

  if (response?.response?.status === 404) {
    notFound();
  }

  const islandData = response?.data?.data;
  if (!islandData) {
    // islandData 載入失敗：顯示錯誤頁與重試（task 4.4）
    return <IslandError identifier={identifier} />;
  }

  return <IslandPageClient islandData={islandData} identifier={identifier} />;
}
