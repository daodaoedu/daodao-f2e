"use client";

import {
  archiveLighthouseCohort,
  archiveLighthouseProgram,
  createLighthouseCohort,
  createLighthouseProgram,
  type LighthouseCohortType,
  setLighthouseTemplateBinding,
  updateLighthouseCohort,
  updateLighthouseProgram,
  useLighthouseCohorts,
  useLighthouseOrganizations,
  useLighthousePrograms,
  useLighthouseTemplates,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Input } from "@daodao/ui/components/input";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  CalendarDays,
  Plus,
  RadioTower,
  Send,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { JoinCode } from "./join-code";

type CohortTemplateSummary = { id: number; title: string; boundCohortIds: number[] };

interface CohortCardProps {
  programId: number;
  cohort: LighthouseCohortType;
  templates?: CohortTemplateSummary[];
  refresh: () => Promise<unknown>;
}

function CohortCard({ programId, cohort, templates, refresh }: CohortCardProps) {
  const t = useTranslations("lighthouse");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handlePublish() {
    if (!window.confirm(t("cohort_publish_confirm"))) {
      return;
    }
    setBusy(true);
    const response = await updateLighthouseCohort(programId, cohort.id, { status: "published" });
    setBusy(false);
    if (response.error) {
      toast.error(t("cohort_publish_failed"));
      return;
    }
    await refresh();
    toast.success(t("cohort_published"));
  }

  async function handleArchive() {
    if (!window.confirm(t("cohort_archive_confirm"))) {
      return;
    }
    setBusy(true);
    const response = await archiveLighthouseCohort(programId, cohort.id);
    setBusy(false);
    if (response.error) {
      toast.error(t("cohort_archive_failed"));
      return;
    }
    await refresh();
    toast.success(t("cohort_archived"));
  }

  async function handleEdit(formData: FormData) {
    const startDate = String(formData.get("startDate") ?? "");
    const endDate = String(formData.get("endDate") ?? "");
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      toast.error(t("cohort_date_error"));
      return;
    }
    const capacityValue = String(formData.get("capacity") ?? "");
    setBusy(true);
    const response = await updateLighthouseCohort(programId, cohort.id, {
      displayName: String(formData.get("displayName") ?? "").trim(),
      startDate,
      endDate,
      joinDeadline: String(formData.get("joinDeadline") ?? "") || null,
      capacity: capacityValue ? Number(capacityValue) : null,
      inviteMessage: String(formData.get("inviteMessage") ?? "").trim() || null,
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await refresh();
    setEditing(false);
    toast.success(t("cohort_saved"));
  }

  const missingTemplates =
    templates && !templates.some((tpl) => tpl.boundCohortIds.includes(cohort.id));

  if (editing) {
    return (
      <form
        action={handleEdit}
        className="grid gap-4 rounded-2xl border border-[#CDEBE8] bg-[#F0FBF9] p-5 md:grid-cols-2"
      >
        <h4 className="text-sm font-semibold md:col-span-2">{t("cohort_edit_title")}</h4>
        <label
          htmlFor={`cohort-edit-name-${cohort.id}`}
          className="grid gap-1.5 text-sm font-medium"
        >
          {t("cohort_display_name")}
          <Input
            id={`cohort-edit-name-${cohort.id}`}
            name="displayName"
            required
            defaultValue={cohort.displayName}
          />
        </label>
        <label
          htmlFor={`cohort-edit-capacity-${cohort.id}`}
          className="grid gap-1.5 text-sm font-medium"
        >
          {t("capacity")}
          <Input
            id={`cohort-edit-capacity-${cohort.id}`}
            name="capacity"
            type="number"
            min={1}
            defaultValue={cohort.capacity ?? ""}
          />
        </label>
        <label
          htmlFor={`cohort-edit-start-${cohort.id}`}
          className="grid gap-1.5 text-sm font-medium"
        >
          {t("start_date")}
          <Input
            id={`cohort-edit-start-${cohort.id}`}
            name="startDate"
            type="date"
            required
            defaultValue={cohort.startDate.slice(0, 10)}
          />
        </label>
        <label
          htmlFor={`cohort-edit-end-${cohort.id}`}
          className="grid gap-1.5 text-sm font-medium"
        >
          {t("end_date")}
          <Input
            id={`cohort-edit-end-${cohort.id}`}
            name="endDate"
            type="date"
            required
            defaultValue={cohort.endDate.slice(0, 10)}
          />
        </label>
        <label
          htmlFor={`cohort-edit-deadline-${cohort.id}`}
          className="grid gap-1.5 text-sm font-medium"
        >
          {t("join_deadline")}
          <Input
            id={`cohort-edit-deadline-${cohort.id}`}
            name="joinDeadline"
            type="datetime-local"
            defaultValue={cohort.joinDeadline?.slice(0, 16) ?? ""}
          />
        </label>
        <label
          htmlFor={`cohort-edit-message-${cohort.id}`}
          className="grid gap-1.5 text-sm font-medium md:col-span-2"
        >
          {t("invite_message")}
          <Textarea
            id={`cohort-edit-message-${cohort.id}`}
            name="inviteMessage"
            defaultValue={cohort.inviteMessage ?? ""}
          />
        </label>
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={busy}>
            {t("save")}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)} disabled={busy}>
            {t("cancel")}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#DDEFED] px-5 py-4 lg:flex-row lg:items-center">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
        <CalendarDays className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold">{cohort.displayName}</h4>
          <span className="rounded-full bg-[#EDF8F6] px-2.5 py-1 font-mono text-[10px] uppercase text-[#0D7773]">
            {t(`cohort_status_${cohort.status}`)}
          </span>
          {missingTemplates && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6E8] px-2.5 py-1 text-[10px] font-semibold text-[#A95D00]">
              <AlertTriangle className="size-3" />
              {t("cohort_no_templates_warning")}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-[#78928F]">
          {cohort.startDate.slice(0, 10)} — {cohort.endDate.slice(0, 10)} · /{cohort.slug}
        </p>
        {cohort.joinToken && <JoinCode joinToken={cohort.joinToken} />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {cohort.status === "draft" && (
          <Button size="sm" onClick={handlePublish} disabled={busy}>
            <Send className="size-4" />
            {t("cohort_publish")}
          </Button>
        )}
        {cohort.status !== "archived" && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} disabled={busy}>
            {t("edit")}
          </Button>
        )}
        {cohort.status === "published" && (
          <Button variant="ghost" size="sm" onClick={handleArchive} disabled={busy}>
            <Archive className="size-4" />
            {t("archive")}
          </Button>
        )}
        <CustomLink
          href={`/lighthouse/programs/${programId}/cohorts/${cohort.id}/dashboard`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0D7773]"
        >
          {t("manage_cohort")}
          <ArrowUpRight className="size-4" />
        </CustomLink>
      </div>
    </div>
  );
}

interface ProgramPanelProps {
  program: {
    id: number;
    organizationId: number;
    name: string;
    description: string | null;
  };
  refreshPrograms: () => Promise<unknown>;
}

function ProgramPanel({ program, refreshPrograms }: ProgramPanelProps) {
  const t = useTranslations("lighthouse");
  const { cohorts, isLoading, mutate } = useLighthouseCohorts(program.id);
  const templatesQuery = useLighthouseTemplates(program.organizationId);
  const templates = templatesQuery.data?.data;
  const selectedTemplatesRef = useRef<Set<number>>(new Set());
  const [editing, setEditing] = useState(false);
  const [creatingCohort, setCreatingCohort] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleProgramUpdate(formData: FormData) {
    setBusy(true);
    const response = await updateLighthouseProgram(program.id, {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await refreshPrograms();
    setEditing(false);
    toast.success(t("program_saved"));
  }

  async function handleArchive() {
    if (cohorts?.length) {
      toast.error(t("program_archive_blocked"));
      return;
    }
    if (!window.confirm(t("program_archive_confirm"))) {
      return;
    }
    setBusy(true);
    const response = await archiveLighthouseProgram(program.id);
    setBusy(false);
    if (response.error) {
      toast.error(t("program_archive_blocked"));
      return;
    }
    await refreshPrograms();
    toast.success(t("program_archived"));
  }

  async function handleCohortCreate(formData: FormData) {
    const startDate = String(formData.get("startDate") ?? "");
    const endDate = String(formData.get("endDate") ?? "");
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      toast.error(t("cohort_date_error"));
      return;
    }
    const capacityValue = String(formData.get("capacity") ?? "");
    setBusy(true);
    const response = await createLighthouseCohort(program.id, {
      slug: String(formData.get("slug") ?? "").trim(),
      displayName: String(formData.get("displayName") ?? "").trim(),
      startDate,
      endDate,
      joinDeadline: String(formData.get("joinDeadline") ?? "") || null,
      capacity: capacityValue ? Number(capacityValue) : null,
      inviteMessage: String(formData.get("inviteMessage") ?? "").trim() || null,
      status: formData.get("publish") === "on" ? "published" : "draft",
    });
    if (response.error || !response.data) {
      setBusy(false);
      toast.error(t("cohort_create_failed"));
      return;
    }
    const newCohortId = (response.data as { data: { id: number } }).data.id;
    const templateIds = Array.from(selectedTemplatesRef.current);
    await Promise.all(
      templateIds.map((templateId) =>
        setLighthouseTemplateBinding(program.organizationId, templateId, newCohortId, true)
      )
    );
    selectedTemplatesRef.current.clear();
    setBusy(false);
    await mutate();
    setCreatingCohort(false);
    toast.success(t("cohort_created"));
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-[#CDEBE8] bg-white">
      <div className="flex flex-col gap-5 border-b border-[#DDEFED] px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        {editing ? (
          <form action={handleProgramUpdate} className="grid w-full max-w-xl gap-3">
            <Input
              name="name"
              required
              defaultValue={program.name}
              aria-label={t("program_name")}
            />
            <Textarea
              name="description"
              defaultValue={program.description ?? ""}
              aria-label={t("program_description")}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                {t("save")}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0D7773]">
              {t("program_label")}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{program.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5A7B79]">
              {program.description || t("program_no_description")}
            </p>
          </div>
        )}
        {!editing && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {t("edit")}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleArchive} disabled={busy}>
              <Archive className="size-4" />
              {t("archive")}
            </Button>
          </div>
        )}
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">{t("cohorts_title")}</h3>
          <Button size="sm" onClick={() => setCreatingCohort((value) => !value)}>
            {creatingCohort ? <X className="size-4" /> : <Plus className="size-4" />}
            {creatingCohort ? t("close") : t("cohort_create")}
          </Button>
        </div>

        {creatingCohort && (
          <form
            action={handleCohortCreate}
            className="mt-5 grid gap-4 rounded-2xl bg-[#F0FBF9] p-5 md:grid-cols-2"
          >
            <label
              htmlFor={`cohort-name-${program.id}`}
              className="grid gap-1.5 text-sm font-medium"
            >
              {t("cohort_display_name")}
              <Input id={`cohort-name-${program.id}`} name="displayName" required />
            </label>
            <label
              htmlFor={`cohort-slug-${program.id}`}
              className="grid gap-1.5 text-sm font-medium"
            >
              {t("cohort_slug")}
              <Input
                id={`cohort-slug-${program.id}`}
                name="slug"
                required
                pattern="[a-z0-9-]+"
                placeholder="2026-summer"
              />
            </label>
            <label
              htmlFor={`cohort-start-${program.id}`}
              className="grid gap-1.5 text-sm font-medium"
            >
              {t("start_date")}
              <Input id={`cohort-start-${program.id}`} name="startDate" type="date" required />
            </label>
            <label
              htmlFor={`cohort-end-${program.id}`}
              className="grid gap-1.5 text-sm font-medium"
            >
              {t("end_date")}
              <Input id={`cohort-end-${program.id}`} name="endDate" type="date" required />
            </label>
            <label
              htmlFor={`cohort-deadline-${program.id}`}
              className="grid gap-1.5 text-sm font-medium"
            >
              {t("join_deadline")}
              <Input
                id={`cohort-deadline-${program.id}`}
                name="joinDeadline"
                type="datetime-local"
              />
            </label>
            <label
              htmlFor={`cohort-capacity-${program.id}`}
              className="grid gap-1.5 text-sm font-medium"
            >
              {t("capacity")}
              <Input id={`cohort-capacity-${program.id}`} name="capacity" type="number" min={1} />
            </label>
            <label
              htmlFor={`cohort-message-${program.id}`}
              className="grid gap-1.5 text-sm font-medium md:col-span-2"
            >
              {t("invite_message")}
              <Textarea id={`cohort-message-${program.id}`} name="inviteMessage" />
            </label>
            {templates && templates.length > 0 && (
              <fieldset className="md:col-span-2">
                <legend className="text-sm font-medium">{t("cohort_select_templates")}</legend>
                <p className="mt-1 text-xs text-[#78928F]">{t("cohort_select_templates_hint")}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {templates.map((tpl) => (
                    <label
                      key={tpl.id}
                      className="flex items-center gap-3 rounded-xl border border-[#DDEFED] px-4 py-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="size-4 accent-[#0D7773]"
                        onChange={(e) => {
                          if (e.target.checked) selectedTemplatesRef.current.add(tpl.id);
                          else selectedTemplatesRef.current.delete(tpl.id);
                        }}
                        ref={(el) => {
                          if (el) selectedTemplatesRef.current.add(tpl.id);
                        }}
                      />
                      {tpl.title}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <label className="flex items-center gap-3 text-sm font-medium md:col-span-2">
              <input name="publish" type="checkbox" className="size-4 accent-[#0D7773]" />
              {t("publish_now")}
            </label>
            <div className="md:col-span-2">
              <Button type="submit" disabled={busy}>
                {t("cohort_create")}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-5 grid gap-3">
          {isLoading && <p className="text-sm text-[#5A7B79]">{t("loading")}</p>}
          {!isLoading && !cohorts?.length && (
            <p className="rounded-2xl border border-dashed border-[#B9DCD8] px-5 py-8 text-center text-sm text-[#5A7B79]">
              {t("cohorts_empty")}
            </p>
          )}
          {cohorts?.map((cohort) => (
            <CohortCard
              key={cohort.id}
              programId={program.id}
              cohort={cohort}
              templates={templates}
              refresh={mutate}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

export function ProgramsManager() {
  const t = useTranslations("lighthouse");
  const { organizations } = useLighthouseOrganizations();
  const organization = organizations?.[0];
  const { programs, isLoading, mutate } = useLighthousePrograms(organization?.id);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleCreate(formData: FormData) {
    if (!organization) return;
    setBusy(true);
    const response = await createLighthouseProgram({
      organizationId: organization.id,
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("program_create_failed"));
      return;
    }
    await mutate();
    setCreating(false);
    toast.success(t("program_created"));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
            {t("programs_eyebrow")}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
            {t("programs_title")}
          </h1>
          <p className="mt-3 max-w-2xl text-[#5A7B79]">{t("programs_description")}</p>
        </div>
        <Button onClick={() => setCreating((value) => !value)}>
          {creating ? <X className="size-4" /> : <Plus className="size-4" />}
          {creating ? t("close") : t("program_create")}
        </Button>
      </header>

      {creating && (
        <form
          action={handleCreate}
          className="mt-8 grid gap-4 rounded-3xl border border-[#CDEBE8] bg-white p-6"
        >
          <div className="flex items-center gap-3">
            <RadioTower className="size-5 text-[#0D7773]" />
            <h2 className="text-lg font-semibold">{t("program_create")}</h2>
          </div>
          <Input name="name" required placeholder={t("program_name")} />
          <Textarea
            name="description"
            placeholder={t("program_description")}
          />
          <div>
            <Button type="submit" disabled={busy || !organization}>
              {t("create")}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 grid gap-5">
        {isLoading && <p className="text-sm text-[#5A7B79]">{t("loading")}</p>}
        {!isLoading && !programs?.length && (
          <div className="rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-16 text-center">
            <RadioTower className="mx-auto size-8 text-[#0D7773]" />
            <h2 className="mt-4 text-xl font-semibold">{t("programs_empty_title")}</h2>
            <p className="mt-2 text-sm text-[#5A7B79]">{t("programs_empty_copy")}</p>
          </div>
        )}
        {programs?.map((program) => (
          <ProgramPanel key={program.id} program={program} refreshPrograms={() => mutate()} />
        ))}
      </div>
    </div>
  );
}
