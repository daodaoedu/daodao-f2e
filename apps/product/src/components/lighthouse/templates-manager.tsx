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
  generatedDraftCount: number;
}

function numberOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "");
  return text ? Number(text) : null;
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
      <label htmlFor="duration" className="grid gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          03 · {t("template_step_duration")}
        </span>
        <Input
          id="duration"
          name="durationDays"
          type="number"
          min={1}
          defaultValue={initial?.durationDays ?? undefined}
        />
      </label>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          04 · {t("template_step_frequency")}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            name="frequencyMinDays"
            type="number"
            min={1}
            defaultValue={initial?.frequencyMinDays ?? undefined}
            placeholder={t("minimum")}
          />
          <Input
            name="frequencyMaxDays"
            type="number"
            min={1}
            defaultValue={initial?.frequencyMaxDays ?? undefined}
            placeholder={t("maximum")}
          />
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
          05 · {t("template_step_context")}
        </p>
        <Input
          name="sessionDurationMinutes"
          type="number"
          min={1}
          defaultValue={initial?.sessionDurationMinutes ?? undefined}
          placeholder={t("session_minutes")}
          className="mt-2"
        />
      </div>
      <Input
        name="practiceTimePeriods"
        defaultValue={initial?.practiceTimePeriods.join(", ")}
        placeholder={t("time_periods")}
        className="self-end"
      />
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
  refresh,
}: {
  organizationId: number;
  templateId: number;
  programId: number;
  boundIds: number[];
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
  return cohorts?.map((cohort) => {
    const bound = boundIds.includes(cohort.id);
    return (
      <button
        key={cohort.id}
        type="button"
        onClick={() => void toggle(cohort.id, !bound)}
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${bound ? "border-[#0D7773] bg-[#E7FAF7] text-[#0D5B59]" : "border-[#CDEBE8] text-[#5A7B79]"}`}
      >
        {bound ? "✓ " : "+ "}
        {cohort.displayName}
      </button>
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
      frequencyMinDays: numberOrNull(formData.get("frequencyMinDays")),
      frequencyMaxDays: numberOrNull(formData.get("frequencyMaxDays")),
      sessionDurationMinutes: numberOrNull(formData.get("sessionDurationMinutes")),
      practiceTimePeriods: String(formData.get("practiceTimePeriods") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
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
    const min = numberOrNull(formData.get("frequencyMinDays"));
    const max = numberOrNull(formData.get("frequencyMaxDays"));
    if (min && max && min > max) {
      toast.error(t("frequency_error"));
      return;
    }
    setBusy(true);
    const response = await createLighthouseTemplate(organization.id, {
      title: String(formData.get("title") ?? "").trim(),
      practiceAction: String(formData.get("practiceAction") ?? "").trim() || null,
      durationDays: numberOrNull(formData.get("durationDays")),
      frequencyMinDays: min,
      frequencyMaxDays: max,
      sessionDurationMinutes: numberOrNull(formData.get("sessionDurationMinutes")),
      practiceTimePeriods: String(formData.get("practiceTimePeriods") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
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
