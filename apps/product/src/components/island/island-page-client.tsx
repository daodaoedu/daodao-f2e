"use client";

import type { IslandDataType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import dynamic from "next/dynamic";
import { IslandLoading } from "./island-loading";

/**
 * 3D 島嶼頁 client 殼（task 4.1）：
 * three.js 引擎整包 dynamic import（ssr: false），主站 bundle 零影響。
 */

const IslandCanvas = dynamic(() => import("./island-canvas"), {
  ssr: false,
  loading: () => <IslandLoadingWithText />,
});

function IslandLoadingWithText() {
  const t = useTranslations("island");
  return <IslandLoading message={t("loading")} />;
}

interface IslandPageClientProps {
  islandData: IslandDataType;
  identifier: string;
}

export function IslandPageClient({ islandData, identifier }: IslandPageClientProps) {
  return <IslandCanvas islandData={islandData} identifier={identifier} />;
}
