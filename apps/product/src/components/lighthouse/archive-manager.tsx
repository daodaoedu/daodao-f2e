"use client";

import {
  deleteLighthouseArchiveItem,
  LIGHTHOUSE_ARCHIVE_TYPES,
  type LighthouseArchiveItem,
  type LighthouseArchiveType,
  restoreLighthouseArchiveItem,
  useLighthouseArchive,
  useLighthouseOrganizations,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";

const RESTORE_NOTICE_MS = 3000;

/** 封存區（FR-ARC-01~03）：模板／場次／系列三分類、恢復（3 秒提示）、刪除（二次確認） */
export function ArchiveManager() {
  const t = useTranslations("lighthouse");
  const { organizations } = useLighthouseOrganizations();
  const organization = organizations?.[0];
  const [type, setType] = useState<LighthouseArchiveType>("templates");
  const archiveQuery = useLighthouseArchive(organization?.id, type);
  const items = archiveQuery.data?.data.items ?? [];
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<LighthouseArchiveItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), RESTORE_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function switchType(next: LighthouseArchiveType) {
    setType(next);
    setNotice(null);
  }

  async function restore(item: LighthouseArchiveItem) {
    if (!organization) return;
    setBusyId(item.id);
    const response = await restoreLighthouseArchiveItem(organization.id, type, item.id);
    setBusyId(null);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("archive_restore_failed"));
      return;
    }
    await archiveQuery.mutate();
    setNotice(t("archive_restored", { name: item.name }));
  }

  async function remove() {
    if (!organization || !pending) return;
    setBusyId(pending.id);
    const response = await deleteLighthouseArchiveItem(organization.id, type, pending.id);
    setBusyId(null);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("archive_delete_failed"));
      return;
    }
    setPending(null);
    await archiveQuery.mutate();
    toast.success(t("archive_deleted"));
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10 md:py-14">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("archive_eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold leading-[1.45] tracking-[-0.04em] md:text-3xl">
          {t("archive_title")}
        </h1>
      </header>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label={t("archive_title")}>
        {LIGHTHOUSE_ARCHIVE_TYPES.map((item) => {
          const active = item === type;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchType(item)}
              className={cn(
                "h-[34px] rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan",
                active
                  ? "border-[#0D3036] bg-[#0D3036] text-white"
                  : "border-[#CDEBE8] bg-white text-[#345E5B] hover:bg-[#F5FFFD]"
              )}
            >
              {t(`archive_tab_${item}`)}
            </button>
          );
        })}
      </div>

      {notice && (
        <output
          aria-live="polite"
          className="mt-4 block rounded-2xl border border-[#B9E6E0] bg-[#F0FBF9] px-4 py-3 text-sm text-[#0D5B59]"
        >
          {notice}
        </output>
      )}

      <section className="mt-5 overflow-x-auto rounded-[20px] border border-[#CDEBE8] bg-white">
        <div className="grid min-w-[520px] grid-cols-[minmax(180px,1fr)_minmax(120px,0.45fr)_minmax(132px,0.35fr)] gap-3 border-b border-[#DDEFED] bg-[#F7FCFB] px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-[#78928F]">
          <span>{t("archive_col_name")}</span>
          <span>{t("archive_col_date")}</span>
          <span>{t("archive_col_actions")}</span>
        </div>
        {archiveQuery.isLoading && (
          <p className="px-5 py-8 text-sm text-[#78928F]">{t("loading")}</p>
        )}
        {!archiveQuery.isLoading && items.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-[#78928F]">{t("archive_empty")}</p>
        )}
        {items.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="grid min-w-[520px] grid-cols-[minmax(180px,1fr)_minmax(120px,0.45fr)_minmax(132px,0.35fr)] items-center gap-3 border-b border-[#EEF6F5] px-5 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#0D3036]">{item.name}</p>
              {item.parentName && (
                <p className="mt-1 truncate text-xs text-[#78928F]">
                  {t("archive_parent", { name: item.parentName })}
                  {item.parentArchived ? ` · ${t("archive_parent_archived")}` : ""}
                </p>
              )}
              {item.archivedBy && (
                <p className="mt-1 truncate text-xs text-[#78928F]">
                  {t("archive_by", { name: item.archivedBy.name })}
                </p>
              )}
            </div>
            <span className="font-mono text-xs text-[#0D7773]">
              {formatDate(item.archivedAt, organization?.timezone)}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-[30px] rounded-full border-[#0D7773] px-3 text-xs font-semibold text-[#0D7773]"
                disabled={busyId === item.id || item.parentArchived}
                title={item.parentArchived ? t("archive_restore_parent_first") : undefined}
                onClick={() => void restore(item)}
              >
                {t("archive_restore")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-[30px] rounded-full border-[#C03A3A] px-3 text-xs font-semibold text-[#C03A3A] hover:bg-[#FCEDED]"
                disabled={busyId === item.id}
                onClick={() => setPending(item)}
              >
                {t("delete")}
              </Button>
            </div>
          </div>
        ))}
      </section>

      <ConfirmDialog
        open={pending !== null}
        title={t("archive_delete_title")}
        description={pending ? t("archive_delete_message", { name: pending.name }) : undefined}
        confirmLabel={t("delete")}
        destructive
        busy={pending !== null && busyId === pending.id}
        onConfirm={remove}
        onOpenChange={(open) => !open && setPending(null)}
      />
    </div>
  );
}

/** 以組織時區顯示封存日期；用 UTC 日期會讓台灣凌晨封存的項目顯示成前一天 */
function formatDate(value: string | null, timeZone?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  // 與模板卡「最後更新」同格式（YYYY/MM/DD）
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: timeZone || "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
