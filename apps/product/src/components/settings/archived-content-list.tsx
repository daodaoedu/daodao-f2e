"use client";

import type { UpdatePracticeRequestType } from "@daodao/api";
import { deletePractice, updatePractice, useMyPractices, useUnarchivePractice } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback, useState } from "react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export const ArchivedContentList = () => {
  const t = useTranslations("app_product");
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const { unarchivePractice } = useUnarchivePractice();
  const { openWarningDialog } = useDialog();

  const { data, isLoading, error, mutate } = useMyPractices({
    status: "archived",
    limit: 100,
  });

  const practices = data?.data || [];

  const markBusy = useCallback(
    (id: string) => setBusyIds((prev) => new Set(prev).add(id)),
    []
  );
  const clearBusy = useCallback(
    (id: string) =>
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }),
    []
  );

  const handleUnarchive = useCallback(
    async (practiceId: string) => {
      if (busyIds.has(practiceId)) return;
      markBusy(practiceId);

      try {
        await unarchivePractice(practiceId);
        await mutate();

        toast.success(t("archived_unarchived"), {
          action: {
            label: t("undo"),
            onClick: async () => {
              try {
                const res = await updatePractice(practiceId, {
                  status: "archived",
                } as UpdatePracticeRequestType);
                if (res.error) {
                  toast.error(t("archived_restore_failed"));
                  return;
                }
                await mutate();
                toast.success(t("archived_restored"));
              } catch {
                toast.error(t("archived_restore_failed"));
              }
            },
          },
        });

        clearBusy(practiceId);
      } catch {
        toast.error(t("archived_unarchive_failed"));
        clearBusy(practiceId);
      }
    },
    [busyIds, unarchivePractice, mutate, t, markBusy, clearBusy]
  );

  const handleDelete = useCallback(
    async (practiceId: string) => {
      if (busyIds.has(practiceId)) return;

      const result = await openWarningDialog({
        title: t("archived_delete_title"),
        message: t("archived_delete_message"),
        textAlign: "left",
        buttons: [
          { label: t("archived_delete_confirm"), value: "confirm", variant: "outline" },
          { label: t("archived_delete_cancel"), value: "cancel", variant: "orange" },
        ],
      });
      if (result.value !== "confirm") return;

      markBusy(practiceId);
      try {
        await deletePractice(practiceId);
        await mutate();
        toast.success(t("archived_deleted"));
      } catch {
        toast.error(t("archived_delete_failed"));
      }
      clearBusy(practiceId);
    },
    [busyIds, openWarningDialog, mutate, t, markBusy, clearBusy]
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-6">{t("archived_practices_title")}</h2>
        <div className="text-center py-8 text-basic-400">
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-6">{t("archived_practices_title")}</h2>
        <div className="text-center py-8 text-basic-400">
          <p>{t("load_failed_retry")}</p>
        </div>
      </div>
    );
  }

  if (practices.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <div className="text-center py-8 text-basic-400">
          <p>{t("archived_empty")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {practices.map((practice) => (
        <div
          key={practice.id}
          className="flex flex-col gap-2 p-4 rounded-lg bg-white"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded bg-[#E8FAF9] text-logo-cyan">
                  {t("archived_type_practice")}
                </span>
                {practice.updatedAt && (
                  <span className="text-[11px] text-[#9FB5B8]">
                    {formatDate(practice.updatedAt)}
                  </span>
                )}
              </div>
              <h3 className="text-base font-medium text-text-dark line-clamp-1">
                {practice.title}
              </h3>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUnarchive(practice.id)}
              disabled={busyIds.has(practice.id)}
              className="h-8 px-4 text-xs"
            >
              {t("archived_unarchive")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(practice.id)}
              disabled={busyIds.has(practice.id)}
              className="h-8 px-4 text-xs text-red hover:text-red hover:border-red/30"
            >
              {t("archived_delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
