"use client";

import {
  archiveLighthouseCohort,
  duplicateLighthouseCohort,
  type LighthouseOrganizationCohortType,
  updateLighthouseCohort,
  useLighthouseOrganizationCohorts,
  useLighthouseOrganizations,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { cn } from "@daodao/ui/lib/utils";
import { Archive, ArrowUpRight, Copy, MoreVertical, Pencil, RadioTower, Send } from "lucide-react";
import { useState } from "react";

/** FR-OV-02：狀態標籤三色——已發佈綠底、草稿灰底、已封存紅底 */
const STATUS_STYLES: Record<LighthouseOrganizationCohortType["status"], string> = {
  published: "bg-[#EDF8F6] text-[#0D7773]",
  draft: "bg-[#F1F4F4] text-[#5A7B79]",
  archived: "bg-[#FDECEC] text-[#C03A3A]",
};

function errorMessage(error: unknown, fallback: string): string {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message: unknown }).message)
    : fallback;
}

interface CohortCardProps {
  cohort: LighthouseOrganizationCohortType;
  refresh: () => Promise<unknown>;
}

function CohortCard({ cohort, refresh }: CohortCardProps) {
  const t = useTranslations("lighthouse");
  const router = useRouter();
  const { openWarningDialog } = useDialog();
  const [busy, setBusy] = useState(false);
  const manageHref = `/lighthouse/programs/${cohort.programId}/cohorts/${cohort.id}/dashboard`;
  const editHref = `/lighthouse/programs?edit=${cohort.id}#cohort-${cohort.id}`;

  async function run(action: () => Promise<{ error?: unknown }>, success: string, failure: string) {
    setBusy(true);
    const response = await action();
    if (response.error) {
      toast.error(errorMessage(response.error, failure));
      setBusy(false);
      return;
    }
    toast.success(success);
    await refresh();
    setBusy(false);
  }

  async function handlePublish() {
    const result = await openWarningDialog({
      title: t("cohort_publish"),
      message: t("cohort_publish_confirm"),
      buttons: [
        { label: t("cancel"), value: "cancel", variant: "outline" },
        { label: t("cohort_publish"), value: "publish", variant: "default" },
      ],
    });
    if (result.value !== "publish") return;
    await run(
      () => updateLighthouseCohort(cohort.programId, cohort.id, { status: "published" }),
      t("cohort_published"),
      t("cohort_publish_failed")
    );
  }

  async function handleArchive() {
    const result = await openWarningDialog({
      title: t("archive"),
      message: t("cohort_archive_confirm"),
      buttons: [
        { label: t("cancel"), value: "cancel", variant: "outline" },
        { label: t("archive"), value: "archive", variant: "orange" },
      ],
    });
    if (result.value !== "archive") return;
    await run(
      () => archiveLighthouseCohort(cohort.programId, cohort.id),
      t("cohort_archived"),
      t("cohort_archive_failed")
    );
  }

  async function handleDuplicate() {
    setBusy(true);
    const response = await duplicateLighthouseCohort(cohort.programId, cohort.id);
    if (response.error) {
      toast.error(errorMessage(response.error, t("cohort_duplicate_failed")));
      setBusy(false);
      return;
    }
    toast.success(t("cohort_duplicated", { name: response.data.data.displayName }));
    await refresh();
    setBusy(false);
  }

  return (
    <article
      className="group relative rounded-3xl border border-[#CDEBE8] bg-white p-6 transition-transform hover:-translate-y-0.5 focus-within:-translate-y-0.5"
      aria-labelledby={`cohort-card-${cohort.id}-title`}
    >
      {/* 卡片本體（非按鈕區域）點擊 → 進入場次管理 */}
      <CustomLink
        href={manageHref}
        className="absolute inset-0 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
        aria-label={`${t("manage_cohort")}：${cohort.displayName}`}
      >
        <span className="sr-only">{t("manage_cohort")}</span>
      </CustomLink>

      <div className="pointer-events-none relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
              STATUS_STYLES[cohort.status]
            )}
          >
            {t(`cohort_status_${cohort.status}`)}
          </span>
          <div className="mt-2 flex items-center gap-2">
            <h2
              id={`cohort-card-${cohort.id}-title`}
              className="truncate text-xl font-semibold tracking-[-0.02em]"
            >
              {cohort.displayName}
            </h2>
            {cohort.status !== "archived" && (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="pointer-events-auto relative z-10 size-7 rounded-full border-[#CDEBE8] text-[#0D7773]"
              >
                <CustomLink href={editHref} aria-label={t("cohort_edit")} title={t("cohort_edit")}>
                  <Pencil className="size-3.5" aria-hidden="true" />
                </CustomLink>
              </Button>
            )}
          </div>
          <p className="mt-1 text-xs text-[#78928F]">
            {cohort.startDate.slice(0, 10)} — {cohort.endDate.slice(0, 10)} ·{" "}
            {t("overview_program_label")}：{cohort.programName}
          </p>
        </div>
        <div className="pointer-events-auto relative z-10 flex shrink-0 items-center gap-1">
          <CustomLink
            href={manageHref}
            className="grid size-8 place-items-center rounded-full text-[#0D7773] hover:bg-[#EDF8F6]"
            aria-label={t("manage_cohort")}
            title={t("manage_cohort")}
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </CustomLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={t("cohort_actions")}
                title={t("cohort_actions")}
                disabled={busy}
              >
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36 rounded-xl border-[#CDEBE8]">
              <DropdownMenuItem onClick={handleDuplicate} disabled={busy} className="gap-2">
                <Copy className="size-4" aria-hidden="true" />
                {t("cohort_duplicate")}
              </DropdownMenuItem>
              {cohort.status !== "archived" && (
                <DropdownMenuItem
                  onClick={handleArchive}
                  disabled={busy}
                  className="gap-2 text-[#C03A3A]"
                >
                  <Archive className="size-4" aria-hidden="true" />
                  {t("archive")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="pointer-events-none relative mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#456B68]">
          {t("overview_joined_count", { count: cohort.joinedCount })}
        </p>
        <div className="pointer-events-auto relative z-10 flex items-center gap-2">
          {cohort.status === "draft" && (
            <Button size="sm" onClick={handlePublish} disabled={busy}>
              <Send className="size-4" aria-hidden="true" />
              {t("cohort_publish")}
            </Button>
          )}
          {cohort.status === "published" && (
            <Button asChild variant="outline" size="sm" className="border-[#CDEBE8] text-[#0D5B59]">
              <CustomLink href={editHref}>{t("edit")}</CustomLink>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-[#0D7773]"
            onClick={() => router.push(manageHref)}
          >
            {t("manage_cohort")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function LighthouseOverview() {
  const t = useTranslations("lighthouse");
  const { organizations } = useLighthouseOrganizations();
  const organizationId = organizations?.[0]?.id;
  const { cohorts, isLoading, mutate } = useLighthouseOrganizationCohorts(organizationId);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold leading-[1.08] tracking-[-0.045em] md:text-4xl">
          {t("overview_title")}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#456B68]">
          {t("overview_description")}
        </p>
      </header>
      <section className="mt-10" aria-labelledby="overview-cohorts-title">
        <div className="flex items-center justify-between">
          <h2 id="overview-cohorts-title" className="text-xl font-semibold">
            {t("overview_active_cohorts")}
          </h2>
          <CustomLink
            href="/lighthouse/programs"
            className="text-sm font-semibold text-[#0D7773] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
          >
            {t("nav_programs")}
          </CustomLink>
        </div>
        {isLoading && <p className="mt-6 text-sm text-[#5A7B79]">{t("loading")}</p>}
        {!isLoading && !cohorts?.length && (
          <div className="mt-6 rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-14 text-center">
            <RadioTower className="mx-auto size-8 text-[#0D7773]" aria-hidden="true" />
            <p className="mt-4 font-semibold">{t("overview_empty")}</p>
          </div>
        )}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {cohorts?.map((cohort) => (
            <CohortCard key={cohort.id} cohort={cohort} refresh={mutate} />
          ))}
        </div>
      </section>
    </div>
  );
}
