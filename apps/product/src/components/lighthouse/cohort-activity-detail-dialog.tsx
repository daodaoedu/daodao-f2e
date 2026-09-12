"use client";

import {
  getLighthouseActivityDetail,
  type LighthouseActivityDetail,
  type LighthouseActivityItem,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { ActivityTypeBadge, formatActivityDateTime } from "./cohort-activity-badge";

interface CohortActivityDetailDialogProps {
  programId: number;
  cohortId: number;
  item: LighthouseActivityItem | null;
  onClose: () => void;
}

/** 單筆動態明細（FR-ACT-07）：日期時間、成員、實踐、類型與詳細內容；右上 × 或遮罩關閉 */
export function CohortActivityDetailDialog({
  programId,
  cohortId,
  item,
  onClose,
}: CohortActivityDetailDialogProps) {
  const t = useTranslations("lighthouse");
  const [detail, setDetail] = useState<LighthouseActivityDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    setDetail(null);
    setError(null);
    setLoading(true);
    void getLighthouseActivityDetail(programId, cohortId, item.type, item.id).then((response) => {
      if (cancelled) return;
      setLoading(false);
      if (response.error || !response.data) {
        setError(response.error?.error?.message ?? t("load_failed"));
        return;
      }
      setDetail(response.data.data);
    });
    return () => {
      cancelled = true;
    };
  }, [item, programId, cohortId, t]);

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[min(560px,94vw)] gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 sm:max-w-none"
        data-testid="activity-detail"
      >
        <header className="flex items-start justify-between gap-3 bg-[#F7FCFB] px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] text-[#0D7773]">
              {item ? formatActivityDateTime(item.occurredAt) : ""}
            </p>
            <DialogTitle className="mt-1 truncate text-xl font-semibold text-[#0D3036]">
              {item?.member.nickname ?? t("learner")}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[13px] text-[#5A7B79]">
              {item?.practice.title}
            </DialogDescription>
          </div>
          <button
            type="button"
            className="grid size-8 shrink-0 place-items-center rounded-full text-[#5A7B79] hover:bg-[#EDF8F6]"
            aria-label={t("close")}
            title={t("close")}
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>
        <div className="space-y-4 px-5 py-5">
          {item && <ActivityTypeBadge item={item} />}
          <div>
            <h3 className="text-[13px] font-semibold text-[#0D3036]">
              {t("activity_detail_body")}
            </h3>
            {loading && <p className="mt-2 text-sm text-[#78928F]">{t("loading")}</p>}
            {error && <p className="mt-2 text-sm text-[#C03A3A]">{error}</p>}
            {detail && (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-[1.8] text-[#456B68]">
                {detail.detail ?? detail.summary}
              </p>
            )}
          </div>
          {detail?.target && (
            <div className="rounded-2xl bg-[#F7FCFB] px-4 py-3 text-sm">
              <p className="text-xs font-semibold text-[#0D7773]">
                {t("activity_detail_target", {
                  time: formatActivityDateTime(detail.target.occurredAt),
                })}
              </p>
              <p className="mt-1 text-[#456B68]">{detail.target.summary}</p>
            </div>
          )}
          {detail && detail.images.length > 0 && (
            <ul className="grid grid-cols-3 gap-2">
              {detail.images.map((url) => (
                <li key={url} className="overflow-hidden rounded-xl border border-[#DDEFED]">
                  {/* biome-ignore lint/performance/noImgElement: 打卡圖片來源為使用者上傳的外部 URL */}
                  <img src={url} alt="" className="aspect-square w-full object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
