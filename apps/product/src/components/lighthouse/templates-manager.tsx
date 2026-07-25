"use client";

import {
  createLighthouseTemplate,
  deleteLighthouseTemplate,
  setLighthouseTemplateBinding,
  updateLighthouseTemplate,
  useLighthouseCohorts,
  useLighthouseOrganizations,
  useLighthousePrograms,
  useLighthouseTemplates,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { BookOpenText, Link2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface TemplateData {
  id: number;
  title: string;
  practiceAction: string | null;
  durationDays: number | null;
  frequencyMinDays: number | null;
  frequencyMaxDays: number | null;
  sessionDurationMinutes: number | null;
  practiceTimePeriods: string[];
  boundCohortIds: number[];
  resources?: Array<{ id: string; name: string; url: string | null }>;
  bindings?: Array<{ cohortId: number; startDate: string | null }>;
  generatedDraftCount: number;
}

const MAX_TEMPLATE_RESOURCES = 5;

type ResourceRow = { key: string; name: string; url: string };

/** 資源列是動態增減的，用 getAll 依序取回並丟掉沒填名稱的空列 */
function readResources(formData: FormData) {
  const names = formData.getAll("resourceName").map(String);
  const urls = formData.getAll("resourceUrl").map(String);
  return names.flatMap((name, index) => {
    const trimmed = name.trim();
    if (!trimmed) return [];
    const url = (urls[index] ?? "").trim();
    return [url ? { name: trimmed, url } : { name: trimmed }];
  });
}

/**
 * 以下選項必須與 practice_templates 的 CHECK 約束一致，且與網站建立實踐的流程同一組；
 * 之前這裡是自由數字輸入，填 10 天 / 20 分鐘會在寫入時炸成 500。
 */
const DURATION_DAY_OPTIONS = [7, 14, 21, 30] as const;
const SESSION_MINUTE_OPTIONS = [15, 30, 45, 60] as const;
const FREQUENCY_OPTIONS = ["2-4", "3-5", "4-7"] as const;
const TIME_PERIOD_OPTIONS = ["morning", "commute", "afternoon", "evening", "night"] as const;

const SELECT_CLASS =
  "mt-2 h-10 w-full rounded-xl border border-[#CDEBE8] bg-white px-3 text-sm text-[#0D3036]";

function numberOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "");
  return text ? Number(text) : null;
}

/** 把既有的 min/max 天數還原成頻率選項；對不上的舊資料原樣保留成一個額外選項 */
function frequencyValue(initial?: TemplateData) {
  if (!initial?.frequencyMinDays || !initial.frequencyMaxDays) return "";
  return `${initial.frequencyMinDays}-${initial.frequencyMaxDays}`;
}

function parseFrequencyRange(value: string) {
  const [min, max] = value.split("-");
  if (!min || !max) return { frequencyMinDays: null, frequencyMaxDays: null };
  return { frequencyMinDays: Number(min), frequencyMaxDays: Number(max) };
}

function TemplateForm({
  initial,
  onSubmit,
  busy,
}: {
  initial?: TemplateData;
  onSubmit: (data: FormData) => void;
  busy: boolean;
}) {
  const t = useTranslations("lighthouse");
  const currentFrequency = frequencyValue(initial);
  const legacyFrequency =
    currentFrequency && !FREQUENCY_OPTIONS.some((range) => range === currentFrequency)
      ? currentFrequency
      : null;
  const [resourceRows, setResourceRows] = useState<ResourceRow[]>(
    () => initial?.resources?.map((r) => ({ key: r.id, name: r.name, url: r.url ?? "" })) ?? []
  );
  return (
    <form
      action={onSubmit}
      className="grid gap-5 rounded-3xl border border-[#CDEBE8] bg-white p-6 md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          01 · {t("template_step_identity")}
        </p>
        <Input
          name="title"
          required
          defaultValue={initial?.title}
          placeholder={t("template_title")}
          className="mt-2"
        />
      </div>
      <div className="md:col-span-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          02 · {t("template_step_action")}
        </p>
        <Textarea
          name="practiceAction"
          defaultValue={initial?.practiceAction ?? ""}
          placeholder={t("template_action")}
          className="mt-2"
        />
      </div>
      <label htmlFor="duration" className="grid">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          03 · {t("template_step_duration")}
        </span>
        <select
          id="duration"
          name="durationDays"
          defaultValue={initial?.durationDays ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">{t("not_specified")}</option>
          {DURATION_DAY_OPTIONS.map((days) => (
            <option key={days} value={days}>
              {t("duration_days_option", { days })}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="frequency" className="grid">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          04 · {t("template_step_frequency")}
        </span>
        <select
          id="frequency"
          name="frequency"
          defaultValue={currentFrequency}
          className={SELECT_CLASS}
        >
          <option value="">{t("not_specified")}</option>
          {FREQUENCY_OPTIONS.map((range) => (
            <option key={range} value={range}>
              {t("frequency_option", { range })}
            </option>
          ))}
          {legacyFrequency && (
            <option value={legacyFrequency}>
              {t("frequency_option", { range: legacyFrequency })}
            </option>
          )}
        </select>
      </label>
      <label htmlFor="session-minutes" className="grid">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          05 · {t("template_step_context")}
        </span>
        <select
          id="session-minutes"
          name="sessionDurationMinutes"
          defaultValue={initial?.sessionDurationMinutes ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">{t("not_specified")}</option>
          {SESSION_MINUTE_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {t("session_minutes_option", { minutes })}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          06 · {t("template_step_time_periods")}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TIME_PERIOD_OPTIONS.map((period) => (
            <label
              key={period}
              className="flex items-center gap-2 rounded-full border border-[#CDEBE8] px-3 py-1.5 text-sm"
            >
              <input
                type="checkbox"
                name="practiceTimePeriods"
                value={period}
                defaultChecked={initial?.practiceTimePeriods.includes(period)}
                className="size-4 accent-[#0D7773]"
              />
              {t(`time_period_${period}` as Parameters<typeof t>[0])}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="md:col-span-2">
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          07 · {t("template_step_resources")}
        </legend>
        <p className="mt-1 text-xs text-[#78928F]">{t("template_resources_hint")}</p>
        <div className="mt-3 grid gap-2">
          {resourceRows.map((row, index) => (
            <div key={row.key} className="flex flex-wrap items-center gap-2">
              <Input
                name="resourceName"
                defaultValue={row.name}
                placeholder={t("template_resource_name")}
                className="min-w-40 flex-1"
              />
              <Input
                name="resourceUrl"
                type="url"
                defaultValue={row.url}
                placeholder="https://example.com"
                className="min-w-40 flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResourceRows((rows) => rows.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        {resourceRows.length < MAX_TEMPLATE_RESOURCES && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() =>
              setResourceRows((rows) => [...rows, { key: `new-${rows.length}`, name: "", url: "" }])
            }
          >
            <Plus className="size-4" />
            {t("template_resource_add")}
          </Button>
        )}
      </fieldset>
      <div className="md:col-span-2">
        <Button type="submit" disabled={busy}>
          {initial ? t("save") : t("create")}
        </Button>
      </div>
    </form>
  );
}

function ProgramBindings({
  organizationId,
  templateId,
  programId,
  boundIds,
  bindings,
  refresh,
}: {
  organizationId: number;
  templateId: number;
  programId: number;
  boundIds: number[];
  bindings: TemplateData["bindings"];
  refresh: () => Promise<unknown>;
}) {
  const t = useTranslations("lighthouse");
  const { cohorts } = useLighthouseCohorts(programId);
  async function toggle(cohortId: number, bound: boolean) {
    const response = await setLighthouseTemplateBinding(
      organizationId,
      templateId,
      cohortId,
      bound
    );
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await refresh();
    toast.success(bound ? t("template_bound") : t("template_unbound"));
  }
  async function setStartDate(cohortId: number, value: string) {
    const response = await setLighthouseTemplateBinding(
      organizationId,
      templateId,
      cohortId,
      true,
      value || null
    );
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await refresh();
    toast.success(t("template_start_date_saved"));
  }
  return cohorts?.map((cohort) => {
    const bound = boundIds.includes(cohort.id);
    const startDate = bindings?.find((item) => item.cohortId === cohort.id)?.startDate;
    return (
      <div key={cohort.id} className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void toggle(cohort.id, !bound)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${bound ? "border-[#0D7773] bg-[#E7FAF7] text-[#0D5B59]" : "border-[#CDEBE8] text-[#5A7B79]"}`}
        >
          {bound ? "✓ " : "+ "}
          {cohort.displayName}
        </button>
        {bound && (
          <label className="flex items-center gap-1.5 text-xs text-[#5A7B79]">
            {t("template_start_date")}
            <input
              type="date"
              defaultValue={startDate?.slice(0, 10) ?? ""}
              onChange={(event) => void setStartDate(cohort.id, event.target.value)}
              className="rounded-lg border border-[#CDEBE8] px-2 py-1 text-xs"
            />
          </label>
        )}
      </div>
    );
  });
}

function TemplateCard({
  organizationId,
  template,
  programIds,
  refresh,
}: {
  organizationId: number;
  template: TemplateData;
  programIds: number[];
  refresh: () => Promise<unknown>;
}) {
  const t = useTranslations("lighthouse");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  async function update(formData: FormData) {
    setBusy(true);
    const response = await updateLighthouseTemplate(organizationId, template.id, {
      title: String(formData.get("title") ?? "").trim(),
      practiceAction: String(formData.get("practiceAction") ?? "").trim() || null,
      durationDays: numberOrNull(formData.get("durationDays")),
      ...parseFrequencyRange(String(formData.get("frequency") ?? "")),
      sessionDurationMinutes: numberOrNull(formData.get("sessionDurationMinutes")),
      practiceTimePeriods: formData.getAll("practiceTimePeriods").map(String),
      resources: readResources(formData),
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await refresh();
    setEditing(false);
    toast.success(t("template_saved"));
  }
  async function remove() {
    if (!window.confirm(t("template_delete_confirm"))) return;
    const response = await deleteLighthouseTemplate(organizationId, template.id);
    if (response.error) {
      toast.error(t("template_delete_blocked"));
      return;
    }
    await refresh();
  }
  if (editing)
    return (
      <div>
        <TemplateForm initial={template} onSubmit={update} busy={busy} />
        <Button className="mt-2" variant="ghost" onClick={() => setEditing(false)}>
          {t("cancel")}
        </Button>
      </div>
    );
  return (
    <article className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
            {t("private_template")}
          </p>
          <h2 className="mt-2 text-xl font-semibold">{template.title}</h2>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            {t("edit")}
          </Button>
          <Button size="sm" variant="ghost" onClick={remove}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#5A7B79]">
        {template.practiceAction || t("template_no_action")}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-2xl bg-[#F0FBF9] p-3">
          <dt className="text-[#78928F]">{t("generated_drafts")}</dt>
          <dd className="mt-1 text-xl font-semibold text-[#0D7773]">
            {template.generatedDraftCount}
          </dd>
        </div>
        <div className="rounded-2xl bg-[#FFF6E8] p-3">
          <dt className="text-[#72593C]">{t("bound_cohorts")}</dt>
          <dd className="mt-1 text-xl font-semibold text-[#A95D00]">
            {template.boundCohortIds.length}
          </dd>
        </div>
      </dl>
      <div className="mt-5">
        <p className="flex items-center gap-2 text-xs font-semibold text-[#456B68]">
          <Link2 className="size-4" />
          {t("bind_to_cohort")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {programIds.map((programId) => (
            <ProgramBindings
              key={programId}
              organizationId={organizationId}
              templateId={template.id}
              programId={programId}
              boundIds={template.boundCohortIds}
              bindings={template.bindings}
              refresh={refresh}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

export function TemplatesManager() {
  const t = useTranslations("lighthouse");
  const { organizations } = useLighthouseOrganizations();
  const organization = organizations?.[0];
  const templatesQuery = useLighthouseTemplates(organization?.id);
  const programsQuery = useLighthousePrograms(organization?.id);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  async function create(formData: FormData) {
    if (!organization) return;
    const frequency = parseFrequencyRange(String(formData.get("frequency") ?? ""));
    setBusy(true);
    const response = await createLighthouseTemplate(organization.id, {
      title: String(formData.get("title") ?? "").trim(),
      practiceAction: String(formData.get("practiceAction") ?? "").trim() || null,
      durationDays: numberOrNull(formData.get("durationDays")),
      ...frequency,
      sessionDurationMinutes: numberOrNull(formData.get("sessionDurationMinutes")),
      practiceTimePeriods: formData.getAll("practiceTimePeriods").map(String),
      resources: readResources(formData),
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await templatesQuery.mutate();
    setCreating(false);
    toast.success(t("template_created"));
  }
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
            {t("templates_eyebrow")}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
            {t("templates_title")}
          </h1>
          <p className="mt-3 max-w-2xl text-[#5A7B79]">{t("templates_description")}</p>
        </div>
        <Button onClick={() => setCreating((value) => !value)}>
          {creating ? <X className="size-4" /> : <Plus className="size-4" />}
          {creating ? t("close") : t("template_create")}
        </Button>
      </header>
      {creating && (
        <div className="mt-8">
          <TemplateForm onSubmit={create} busy={busy} />
        </div>
      )}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {!templatesQuery.isLoading && !templatesQuery.data?.data.length && (
          <div className="rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-16 text-center lg:col-span-2">
            <BookOpenText className="mx-auto size-8 text-[#0D7773]" />
            <p className="mt-4 font-semibold">{t("templates_empty")}</p>
          </div>
        )}
        {organization &&
          templatesQuery.data?.data.map((template) => (
            <TemplateCard
              key={template.id}
              organizationId={organization.id}
              template={template}
              programIds={programsQuery.programs?.map((program) => program.id) ?? []}
              refresh={() => templatesQuery.mutate()}
            />
          ))}
      </div>
    </div>
  );
}
