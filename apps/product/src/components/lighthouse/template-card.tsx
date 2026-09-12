"use client";

import {
  archiveLighthouseTemplate,
  duplicateLighthouseTemplate,
  type LighthouseOrganizationCohortType,
  type LighthouseTemplate,
  setLighthouseTemplateBinding,
} from "@daodao/api";

import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Archive, ChevronDown, Copy, Link2, Lock, MoreVertical, Pencil } from "lucide-react";
import { useState } from "react";
import { addDays, formatSlashDate, isCohortStarted } from "@/utils/template-library";
import { ConfirmDialog } from "./confirm-dialog";
import { LIGHTHOUSE_SCOPE } from "./lighthouse-scope";

interface TemplateCardProps {
  organizationId: number;
  template: LighthouseTemplate;
  cohorts: LighthouseOrganizationCohortType[];
  refresh: () => Promise<unknown>;
  onEdit: (template: LighthouseTemplate) => void;
}

const PREVIEW_ROWS = 2;

type BoundRow = {
  cohortId: number;
  cohortName: string;
  startDate: string;
  endDate: string | null;
  locked: boolean;
};

/**
 * 模板卡（FR-TPL-01/04/05）：草稿標籤、鉛筆編輯、⋮（複製／封存）、描述與最後更新、
 * 綁定下拉（已開始場次鎖定）、已綁定預覽列（開始日／結束日）、查看全部綁定 modal、解綁確認。
 */
export function TemplateCard({
  organizationId,
  template,
  cohorts,
  refresh,
  onEdit,
}: TemplateCardProps) {
  const t = useTranslations("lighthouse");
  const [busy, setBusy] = useState(false);
  const [bindOpen, setBindOpen] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [unbinding, setUnbinding] = useState<BoundRow | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const boundRows: BoundRow[] = template.bindings
    .map((binding) => {
      const startDate = (binding.startDate ?? binding.cohortStartDate).slice(0, 10);
      return {
        cohortId: binding.cohortId,
        cohortName: binding.cohortName,
        startDate,
        endDate:
          binding.endDate?.slice(0, 10) ??
          (template.durationDays ? addDays(startDate, template.durationDays - 1) : null),
        locked: binding.locked,
      };
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  const boundIds = new Set(boundRows.map((row) => row.cohortId));
  const options = cohorts
    .filter((cohort) => cohort.status !== "archived" || boundIds.has(cohort.id))
    .map((cohort) => ({
      id: cohort.id,
      name: cohort.displayName,
      programName: cohort.programName,
      bound: boundIds.has(cohort.id),
      locked:
        boundRows.find((row) => row.cohortId === cohort.id)?.locked ??
        isCohortStarted(cohort.startDate),
    }));

  const description = [
    template.durationDays ? t("template_preview_days", { days: template.durationDays }) : null,
    template.frequencyMaxDays || template.frequencyMinDays
      ? t("template_card_frequency", {
          range: formatRange(template.frequencyMinDays, template.frequencyMaxDays),
        })
      : null,
    template.sessionDurationMinutes
      ? t("template_preview_minutes", { minutes: template.sessionDurationMinutes })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  async function bind(cohortId: number, startDate?: string | null) {
    setBusy(true);
    const response = await setLighthouseTemplateBinding(
      organizationId,
      template.id,
      cohortId,
      true,
      startDate
    );
    setBusy(false);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("save_failed"));
      return;
    }
    await refresh();
    toast.success(startDate === undefined ? t("template_bound") : t("template_start_date_saved"));
  }

  async function unbind() {
    if (!unbinding) return;
    setBusy(true);
    const response = await setLighthouseTemplateBinding(
      organizationId,
      template.id,
      unbinding.cohortId,
      false
    );
    setBusy(false);
    setUnbinding(null);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("save_failed"));
      return;
    }
    await refresh();
    toast.success(t("template_unbound"));
  }

  function toggle(option: (typeof options)[number]) {
    if (option.locked) return;
    if (option.bound) {
      const row = boundRows.find((item) => item.cohortId === option.id);
      if (row) setUnbinding(row);
      return;
    }
    void bind(option.id);
  }

  async function duplicate() {
    setBusy(true);
    const response = await duplicateLighthouseTemplate(organizationId, template.id);
    setBusy(false);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("save_failed"));
      return;
    }
    await refresh();
    toast.success(t("template_duplicated", { name: response.data.data.title }));
  }

  async function archive() {
    setBusy(true);
    const response = await archiveLighthouseTemplate(organizationId, template.id);
    setBusy(false);
    setConfirmArchive(false);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("save_failed"));
      return;
    }
    await refresh();
    toast.success(t("template_archived"));
  }

  const rowView = (row: BoundRow) => (
    <div
      key={row.cohortId}
      className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#DDEFED] bg-[#F7FCFB] px-2.5 py-2"
    >
      <span className="min-w-0 flex-[1_1_140px] truncate text-xs font-semibold text-[#0D5B59]">
        {row.cohortName}
      </span>
      {row.locked && (
        <span
          className="grid size-6 place-items-center rounded-full bg-[#FFF4D6] text-[#A95D00]"
          title={t("template_cohort_started_hint")}
          role="img"
          aria-label={t("template_cohort_started_hint")}
        >
          <Lock className="size-3" aria-hidden="true" />
        </span>
      )}
      <label className="flex items-center gap-1.5 text-xs text-[#5A7B79]">
        {t("template_start_date")}
        <input
          type="date"
          defaultValue={row.startDate}
          disabled={row.locked || busy}
          title={row.locked ? t("template_start_date_locked") : t("template_start_date_adjust")}
          onBlur={(event) => {
            const next = event.target.value;
            if (!next || next === row.startDate) return;
            void bind(row.cohortId, next);
          }}
          className="h-7 rounded-lg border border-[#CDEBE8] px-2 text-xs disabled:cursor-not-allowed disabled:bg-[#F6F9F8]"
        />
      </label>
      {row.endDate && (
        <span className="text-xs text-[#0D7773]">
          {t("template_end_date", { date: formatSlashDate(row.endDate) })}
        </span>
      )}
    </div>
  );

  return (
    <article
      className="rounded-3xl border border-[#CDEBE8] bg-white p-6"
      data-testid={`template-${template.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="truncate text-xl font-semibold tracking-[-0.02em]">{template.title}</h2>
          {template.status === "draft" && (
            <span className="rounded-full bg-[#FFF4D6] px-2 py-0.5 text-xs font-semibold text-[#7A6120]">
              {t("template_draft_badge")}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7 rounded-full border-[#CDEBE8] text-[#0D7773]"
            aria-label={t("edit")}
            title={t("edit")}
            disabled={busy}
            onClick={() => onEdit(template)}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                aria-label={t("template_more_actions")}
                title={t("template_more_actions")}
                disabled={busy}
              >
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36 rounded-xl border-[#CDEBE8]">
              <DropdownMenuItem onClick={() => void duplicate()} disabled={busy} className="gap-2">
                <Copy className="size-4" aria-hidden="true" />
                {t("template_duplicate")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setConfirmArchive(true)}
                disabled={busy}
                className="gap-2 text-[#C03A3A]"
              >
                <Archive className="size-4" aria-hidden="true" />
                {t("archive")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#5A7B79]">
        {template.practiceAction || description || t("template_no_action")}
      </p>
      {template.practiceAction && description && (
        <p className="mt-1 text-xs text-[#78928F]">{description}</p>
      )}
      {template.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span key={tag} className="rounded bg-[#E7FAF7] px-2 py-0.5 text-xs text-[#456B68]">
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-[#78928F]">
        {t("template_last_updated", {
          date: formatSlashDate(template.updatedAt ?? template.createdAt),
        })}
      </p>

      <section className="mt-5">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-[#456B68]">
          <Link2 className="size-3.5" aria-hidden="true" />
          {t("template_bind_title")}
        </h3>
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-between rounded-[10px] border border-[#CDEBE8] px-3 py-2 text-left text-[13px] font-semibold text-[#0D3036] hover:bg-[#F5FFFD]"
          aria-expanded={bindOpen}
          disabled={busy}
          onClick={() => setBindOpen((value) => !value)}
        >
          <span>
            {boundRows.length > 0
              ? t("template_bind_summary", { count: boundRows.length })
              : t("template_bind_summary_none")}
          </span>
          <ChevronDown
            className={cn("size-4 transition-transform", bindOpen && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {bindOpen && (
          <ul
            className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[#DDEFED] p-1.5"
            aria-label={t("template_bind_title")}
          >
            {options.length === 0 && (
              <li className="px-2 py-3 text-xs text-[#78928F]">{t("template_bind_no_cohorts")}</li>
            )}
            {options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={option.bound}
                  disabled={option.locked || busy}
                  title={
                    option.locked
                      ? t("template_cohort_started_hint")
                      : option.bound
                        ? t("template_unbind_hint")
                        : t("template_bind_hint")
                  }
                  onClick={() => toggle(option)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm",
                    option.bound && "bg-[#F0FBF9]",
                    option.locked ? "cursor-not-allowed opacity-70" : "hover:bg-[#F5FFFD]"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded border text-[10px] text-white",
                      option.bound ? "border-[#0D7773] bg-[#0D7773]" : "border-[#B9DCD8]"
                    )}
                    aria-hidden="true"
                  >
                    {option.bound ? "✓" : ""}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {option.name}
                    <span className="ml-1 text-xs text-[#78928F]">{option.programName}</span>
                  </span>
                  {option.locked && (
                    <span className="text-[11px] text-[#A95D00]">
                      {t("template_cohort_started")}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        {boundRows.length > 0 && (
          <div className="mt-2 space-y-2">{boundRows.slice(0, PREVIEW_ROWS).map(rowView)}</div>
        )}
        {boundRows.length > PREVIEW_ROWS && (
          <button
            type="button"
            className="mt-2 w-full rounded-xl border border-dashed border-[#B9DCD8] px-3 py-2 text-xs text-[#0D7773] hover:bg-[#F5FFFD]"
            onClick={() => setAllOpen(true)}
          >
            {t("template_view_all_bindings", { count: boundRows.length })}
          </button>
        )}
      </section>

      <Dialog open={allOpen} onOpenChange={setAllOpen}>
        <DialogContent
          overlayClassName="bg-[#0F3036]/30"
          className={cn(
            "w-[min(620px,94vw)] sm:max-w-none rounded-3xl border-0 bg-white p-6",
            LIGHTHOUSE_SCOPE
          )}
        >
          <DialogHeader className="items-start text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
              {t("template_bindings_title")}
            </p>
            <DialogTitle className="text-left text-xl font-semibold text-[#0D3036]">
              {template.title}
            </DialogTitle>
            <DialogDescription className="text-left text-sm text-[#5A7B79]">
              {t("template_bindings_count", { count: boundRows.length })}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">{boundRows.map(rowView)}</div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={unbinding !== null}
        title={t("template_unlink_confirm_title")}
        description={
          unbinding
            ? t("template_unlink_confirm_message", {
                template: template.title,
                cohort: unbinding.cohortName,
              })
            : undefined
        }
        confirmLabel={t("template_unlink")}
        destructive
        busy={busy}
        onConfirm={unbind}
        onOpenChange={(open) => !open && setUnbinding(null)}
      />
      <ConfirmDialog
        open={confirmArchive}
        title={t("template_archive_title")}
        description={t("template_archive_message", { name: template.title })}
        confirmLabel={t("archive")}
        destructive
        busy={busy}
        onConfirm={archive}
        onOpenChange={setConfirmArchive}
      />
    </article>
  );
}

function formatRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null && min !== max) return `${min}-${max}`;
  return String(min ?? max ?? "");
}
