"use client";

import type { SpaceListItemType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import type { ReactNode } from "react";
import { ListPageShell } from "@/components/layout/list-page-shell";
import { SpaceKindIcon } from "./space-kind-icon";

interface SpacePageShellProps {
  kind: SpaceListItemType["kind"];
  title: string;
  subtitle?: string | null;
  /** 頁首右側（活動課程空間的成員頭像） */
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * 空間子頁外框（FR-4.1、FR-2.6）：返回空間列表＋空間種類圖示＋名稱＋副標。
 * 外框與探索頁共用 ListPageShell（daodao#572）。
 */
export const SpacePageShell = ({
  kind,
  title,
  subtitle,
  actions,
  children,
}: SpacePageShellProps) => {
  const t = useTranslations("space");
  return (
    <ListPageShell
      title={title}
      subtitle={subtitle || undefined}
      icon={<SpaceKindIcon kind={kind} size="header" />}
      back={{ href: "/spaces", label: t("back_to_spaces") }}
      actions={actions}
    >
      {children}
    </ListPageShell>
  );
};
