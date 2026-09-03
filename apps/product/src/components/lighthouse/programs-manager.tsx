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
import { Switch } from "@daodao/ui/components/switch";
import { Textarea } from "@daodao/ui/components/textarea";
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  CalendarDays,
  Globe,
  Minus,
  Plus,
  RadioTower,
  Send,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { JoinCode } from "./join-code";

type SessionEntry = { id: string; sessionDate: string; startTime: string; endTime: string };

type CohortTemplateSummary = { id: number; title: string; boundCohortIds: number[] };

/** 已封存要一眼看得出來，不能和草稿、已發佈長一樣 */
const COHORT_STATUS_STYLES: Record<LighthouseCohortType["status"], string> = {
  draft: "bg-[#F1F4F4] text-[#5A7B79]",
  published: "bg-[#EDF8F6] text-[#0D7773]",
  archived: "bg-[#FDECEC] text-[#C03A3A]",
};

interface CohortCardProps {
  programId: number;
  cohort: LighthouseCohortType;
  templates?: CohortTemplateSummary[];
  refresh: () => Promise<unknown>;
}

function CohortCard({ programId, cohort, templates, refresh }: CohortCardProps) {
  const t = useTranslations("lighthouse");
  const searchParams = useSearchParams();
  // 場次管理頁的「編輯」鉛筆會帶 ?edit=<cohortId> 過來，直接展開該場次的編輯表單
  const [editing, setEditing] = useState(searchParams.get("edit") === String(cohort.id));
  const [busy, setBusy] = useState(false);

  // -- 新欄位的 controlled state（編輯表單用） --
  const [editSessions, setEditSessions] = useState<SessionEntry[]>(() =>
    (cohort.sessions ?? []).map((s, i) => ({
      id: String(s.id ?? i),
      sessionDate: s.sessionDate?.slice(0, 10) ?? "",
      startTime: s.startTime ?? "",
      endTime: s.endTime ?? "",
    }))
  );
  const [editInteractionModes, setEditInteractionModes] = useState<string[]>(
    cohort.interactionModes ?? []
  );
  const [editFeeType, setEditFeeType] = useState<"free" | "paid">(cohort.feeType ?? "free");
  const [editSignupMethod, setEditSignupMethod] = useState<"island_form" | "external">(
    cohort.signupMethod ?? "island_form"
  );
  const [editIsPrivate, setEditIsPrivate] = useState(cohort.isPrivate ?? false);
  const [editCheckinPrivate, setEditCheckinPrivate] = useState(cohort.checkinDefaultPrivate ?? false);
  const [editHostCommentPrivate, setEditHostCommentPrivate] = useState(
    cohort.hostCommentDefaultPrivate ?? false
  );

  const addEditSession = useCallback(() => {
    setEditSessions((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, sessionDate: "", startTime: "", endTime: "" },
    ]);
  }, []);
  const removeEditSession = useCallback((id: string) => {
    setEditSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);
  const updateEditSession = useCallback(
    (id: string, field: keyof SessionEntry, value: string) => {
      setEditSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    []
  );
  const toggleEditInteractionMode = useCallback((mode: string) => {
    setEditInteractionModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  }, []);

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
    const feeAmountValue = String(formData.get("feeAmount") ?? "");
    setBusy(true);
    const response = await updateLighthouseCohort(programId, cohort.id, {
      displayName: String(formData.get("displayName") ?? "").trim(),
      tagline: String(formData.get("tagline") ?? "").trim() || null,
      startDate,
      endDate,
      joinDeadline: String(formData.get("joinDeadline") ?? "") || null,
      capacity: capacityValue ? Number(capacityValue) : null,
      inviteMessage: String(formData.get("inviteMessage") ?? "").trim() || null,
      visibility: formData.get("visibility") === "on" ? "public" : "private",
      interactionModes: editInteractionModes as ("sync" | "async" | "physical")[],
      meetingUrl: String(formData.get("meetingUrl") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      sessions: editSessions
        .filter((s) => s.sessionDate)
        .map((s) => ({
          sessionDate: s.sessionDate,
          startTime: s.startTime || null,
          endTime: s.endTime || null,
        })),
      feeType: editFeeType,
      feeAmount: editFeeType === "paid" && feeAmountValue ? Number(feeAmountValue) : null,
      signupMethod: editSignupMethod,
      externalSignupUrl:
        editSignupMethod === "external"
          ? String(formData.get("externalSignupUrl") ?? "").trim() || null
          : null,
      showInviteMessageOnSignup: formData.get("showInviteMessageOnSignup") === "on",
      isPrivate: editIsPrivate,
      checkinDefaultPrivate: editCheckinPrivate,
      hostCommentDefaultPrivate: editHostCommentPrivate,
    } as Parameters<typeof updateLighthouseCohort>[2]);
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
          htmlFor={`cohort-edit-tagline-${cohort.id}`}
          className="grid gap-1.5 text-sm font-medium"
        >
          {t("cohort_tagline")}
          <Input
            id={`cohort-edit-tagline-${cohort.id}`}
            name="tagline"
            placeholder={t("cohort_tagline_placeholder")}
            defaultValue={cohort.tagline ?? ""}
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
            type="date"
            defaultValue={cohort.joinDeadline?.slice(0, 10) ?? ""}
          />
        </label>

        {/* 互動方式 */}
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">{t("cohort_interaction_modes")}</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {(["sync", "async", "physical"] as const).map((mode) => (
              <label key={mode} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-[#0D7773]"
                  checked={editInteractionModes.includes(mode)}
                  onChange={() => toggleEditInteractionMode(mode)}
                />
                {t(`cohort_interaction_mode_${mode}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <label
          htmlFor={`cohort-edit-meeting-${cohort.id}`}
          className="grid gap-1.5 text-sm font-medium"
        >
          {t("cohort_meeting_url")}
          <Input
            id={`cohort-edit-meeting-${cohort.id}`}
            name="meetingUrl"
            type="url"
            placeholder={t("cohort_meeting_url_placeholder")}
            defaultValue={cohort.meetingUrl ?? ""}
          />
        </label>
        <label
          htmlFor={`cohort-edit-location-${cohort.id}`}
          className="grid gap-1.5 text-sm font-medium"
        >
          {t("cohort_location")}
          <Input
            id={`cohort-edit-location-${cohort.id}`}
            name="location"
            placeholder={t("cohort_location_placeholder")}
            defaultValue={cohort.location ?? ""}
          />
        </label>

        {/* 聚會時段 */}
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">{t("cohort_sessions_title")}</legend>
          <div className="mt-2 grid gap-2">
            {editSessions.map((session) => (
              <div key={session.id} className="flex flex-wrap items-end gap-2">
                {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                <label className="grid gap-1 text-xs">
                  {t("cohort_session_date")}
                  <Input
                    type="date"
                    className="h-9 w-[140px] text-xs"
                    value={session.sessionDate}
                    onChange={(e) => updateEditSession(session.id, "sessionDate", e.target.value)}
                  />
                </label>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                <label className="grid gap-1 text-xs">
                  {t("cohort_session_start_time")}
                  <Input
                    type="time"
                    className="h-9 w-[110px] text-xs"
                    value={session.startTime}
                    onChange={(e) => updateEditSession(session.id, "startTime", e.target.value)}
                  />
                </label>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                <label className="grid gap-1 text-xs">
                  {t("cohort_session_end_time")}
                  <Input
                    type="time"
                    className="h-9 w-[110px] text-xs"
                    value={session.endTime}
                    onChange={(e) => updateEditSession(session.id, "endTime", e.target.value)}
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 text-[#C03A3A]"
                  onClick={() => removeEditSession(session.id)}
                  aria-label={t("cohort_session_remove")}
                >
                  <Minus className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit border-[#CDEBE8]"
              onClick={addEditSession}
            >
              <Plus className="size-4" />
              {t("cohort_session_add")}
            </Button>
          </div>
        </fieldset>

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

        {/* 費用設定 */}
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">{t("cohort_fee_title")}</legend>
          <div className="mt-2 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="feeTypeRadio"
                className="size-4 accent-[#0D7773]"
                checked={editFeeType === "free"}
                onChange={() => setEditFeeType("free")}
              />
              {t("cohort_fee_type_free")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="feeTypeRadio"
                className="size-4 accent-[#0D7773]"
                checked={editFeeType === "paid"}
                onChange={() => setEditFeeType("paid")}
              />
              {t("cohort_fee_type_paid")}
            </label>
            {editFeeType === "paid" && (
              <Input
                name="feeAmount"
                type="number"
                min={0}
                className="h-9 w-[120px]"
                placeholder={t("cohort_fee_amount")}
                defaultValue={cohort.feeAmount ?? ""}
              />
            )}
          </div>
        </fieldset>

        {/* 報名設定 */}
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">{t("cohort_signup_title")}</legend>
          <div className="mt-2 grid gap-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="signupMethodRadio"
                  className="size-4 accent-[#0D7773]"
                  checked={editSignupMethod === "island_form"}
                  onChange={() => setEditSignupMethod("island_form")}
                />
                {t("cohort_signup_method_island_form")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="signupMethodRadio"
                  className="size-4 accent-[#0D7773]"
                  checked={editSignupMethod === "external"}
                  onChange={() => setEditSignupMethod("external")}
                />
                {t("cohort_signup_method_external")}
              </label>
            </div>
            {editSignupMethod === "external" && (
              <Input
                name="externalSignupUrl"
                type="url"
                placeholder={t("cohort_external_signup_url_placeholder")}
                defaultValue={cohort.externalSignupUrl ?? ""}
              />
            )}
            <label className="flex items-center gap-3 text-sm">
              <input
                name="showInviteMessageOnSignup"
                type="checkbox"
                className="size-4 accent-[#0D7773]"
                defaultChecked={cohort.showInviteMessageOnSignup ?? false}
              />
              {t("cohort_show_invite_message_on_signup")}
            </label>
          </div>
        </fieldset>

        {/* 隱私設定 */}
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">{t("cohort_privacy_title")}</legend>
          <div className="mt-2 grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">{t("cohort_is_private")}</p>
                <p className="text-xs text-[#78928F]">{t("cohort_is_private_hint")}</p>
              </div>
              <Switch checked={editIsPrivate} onCheckedChange={setEditIsPrivate} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">{t("cohort_checkin_default_private")}</p>
                <p className="text-xs text-[#78928F]">{t("cohort_checkin_default_private_hint")}</p>
              </div>
              <Switch checked={editCheckinPrivate} onCheckedChange={setEditCheckinPrivate} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">{t("cohort_host_comment_default_private")}</p>
                <p className="text-xs text-[#78928F]">
                  {t("cohort_host_comment_default_private_hint")}
                </p>
              </div>
              <Switch
                checked={editHostCommentPrivate}
                onCheckedChange={setEditHostCommentPrivate}
              />
            </div>
          </div>
        </fieldset>

        <div className="grid gap-1.5 md:col-span-2">
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              name="visibility"
              type="checkbox"
              className="size-4 accent-[#0D7773]"
              defaultChecked={cohort.visibility === "public"}
            />
            {t("cohort_visibility_public")}
          </label>
          <p className="text-xs text-[#78928F]">{t("cohort_visibility_hint")}</p>
        </div>
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
    <div
      id={`cohort-${cohort.id}`}
      className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-[#DDEFED] px-5 py-4 lg:flex-row lg:items-center"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
        <CalendarDays className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold">{cohort.displayName}</h4>
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${COHORT_STATUS_STYLES[cohort.status]}`}
          >
            {t(`cohort_status_${cohort.status}`)}
          </span>
          {cohort.visibility === "public" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E7FAF7] px-2.5 py-1 text-[10px] font-semibold text-[#0D7773]">
              <Globe className="size-3" />
              {t("cohort_visibility_badge")}
            </span>
          )}
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

  // -- 建立表單用的 controlled state --
  const [createSessions, setCreateSessions] = useState<SessionEntry[]>([]);
  const [createInteractionModes, setCreateInteractionModes] = useState<string[]>([]);
  const [createFeeType, setCreateFeeType] = useState<"free" | "paid">("free");
  const [createSignupMethod, setCreateSignupMethod] = useState<"island_form" | "external">(
    "island_form"
  );
  const [createIsPrivate, setCreateIsPrivate] = useState(false);
  const [createCheckinPrivate, setCreateCheckinPrivate] = useState(false);
  const [createHostCommentPrivate, setCreateHostCommentPrivate] = useState(false);

  const addCreateSession = useCallback(() => {
    setCreateSessions((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, sessionDate: "", startTime: "", endTime: "" },
    ]);
  }, []);
  const removeCreateSession = useCallback((id: string) => {
    setCreateSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);
  const updateCreateSession = useCallback(
    (id: string, field: keyof SessionEntry, value: string) => {
      setCreateSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    []
  );
  const toggleCreateInteractionMode = useCallback((mode: string) => {
    setCreateInteractionModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  }, []);

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
    const feeAmountValue = String(formData.get("feeAmount") ?? "");
    setBusy(true);
    const response = await createLighthouseCohort(program.id, {
      slug: String(formData.get("slug") ?? "").trim(),
      displayName: String(formData.get("displayName") ?? "").trim(),
      tagline: String(formData.get("tagline") ?? "").trim() || undefined,
      startDate,
      endDate,
      joinDeadline: String(formData.get("joinDeadline") ?? "") || null,
      capacity: capacityValue ? Number(capacityValue) : null,
      inviteMessage: String(formData.get("inviteMessage") ?? "").trim() || null,
      status: formData.get("publish") === "on" ? "published" : "draft",
      visibility: formData.get("visibility") === "on" ? "public" : "private",
      interactionModes: createInteractionModes as ("sync" | "async" | "physical")[],
      meetingUrl: String(formData.get("meetingUrl") ?? "").trim() || undefined,
      location: String(formData.get("location") ?? "").trim() || undefined,
      sessions: createSessions
        .filter((s) => s.sessionDate)
        .map((s) => ({
          sessionDate: s.sessionDate,
          startTime: s.startTime || undefined,
          endTime: s.endTime || undefined,
        })),
      feeType: createFeeType,
      feeAmount: createFeeType === "paid" && feeAmountValue ? Number(feeAmountValue) : undefined,
      signupMethod: createSignupMethod,
      externalSignupUrl:
        createSignupMethod === "external"
          ? String(formData.get("externalSignupUrl") ?? "").trim() || undefined
          : undefined,
      showInviteMessageOnSignup: formData.get("showInviteMessageOnSignup") === "on",
      isPrivate: createIsPrivate,
      checkinDefaultPrivate: createCheckinPrivate,
      hostCommentDefaultPrivate: createHostCommentPrivate,
    } as Parameters<typeof createLighthouseCohort>[1]);
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
    // 重置建立表單的 controlled state
    setCreateSessions([]);
    setCreateInteractionModes([]);
    setCreateFeeType("free");
    setCreateSignupMethod("island_form");
    setCreateIsPrivate(false);
    setCreateCheckinPrivate(false);
    setCreateHostCommentPrivate(false);
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
              htmlFor={`cohort-tagline-${program.id}`}
              className="grid gap-1.5 text-sm font-medium md:col-span-2"
            >
              {t("cohort_tagline")}
              <Input
                id={`cohort-tagline-${program.id}`}
                name="tagline"
                placeholder={t("cohort_tagline_placeholder")}
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
              {/* 後端與 cohorts.join_deadline 都是 DATE，送 datetime-local 會被擋成 400 */}
              <Input id={`cohort-deadline-${program.id}`} name="joinDeadline" type="date" />
            </label>
            <label
              htmlFor={`cohort-capacity-${program.id}`}
              className="grid gap-1.5 text-sm font-medium"
            >
              {t("capacity")}
              <Input id={`cohort-capacity-${program.id}`} name="capacity" type="number" min={1} />
            </label>

            {/* 互動方式 */}
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">{t("cohort_interaction_modes")}</legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {(["sync", "async", "physical"] as const).map((mode) => (
                  <label key={mode} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-[#0D7773]"
                      checked={createInteractionModes.includes(mode)}
                      onChange={() => toggleCreateInteractionMode(mode)}
                    />
                    {t(`cohort_interaction_mode_${mode}`)}
                  </label>
                ))}
              </div>
            </fieldset>

            <label
              htmlFor={`cohort-meeting-${program.id}`}
              className="grid gap-1.5 text-sm font-medium"
            >
              {t("cohort_meeting_url")}
              <Input
                id={`cohort-meeting-${program.id}`}
                name="meetingUrl"
                type="url"
                placeholder={t("cohort_meeting_url_placeholder")}
              />
            </label>
            <label
              htmlFor={`cohort-location-${program.id}`}
              className="grid gap-1.5 text-sm font-medium"
            >
              {t("cohort_location")}
              <Input
                id={`cohort-location-${program.id}`}
                name="location"
                placeholder={t("cohort_location_placeholder")}
              />
            </label>

            {/* 聚會時段 */}
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">{t("cohort_sessions_title")}</legend>
              <div className="mt-2 grid gap-2">
                {createSessions.map((session) => (
                  <div key={session.id} className="flex flex-wrap items-end gap-2">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1 text-xs">
                      {t("cohort_session_date")}
                      <Input
                        type="date"
                        className="h-9 w-[140px] text-xs"
                        value={session.sessionDate}
                        onChange={(e) =>
                          updateCreateSession(session.id, "sessionDate", e.target.value)
                        }
                      />
                    </label>
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1 text-xs">
                      {t("cohort_session_start_time")}
                      <Input
                        type="time"
                        className="h-9 w-[110px] text-xs"
                        value={session.startTime}
                        onChange={(e) =>
                          updateCreateSession(session.id, "startTime", e.target.value)
                        }
                      />
                    </label>
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1 text-xs">
                      {t("cohort_session_end_time")}
                      <Input
                        type="time"
                        className="h-9 w-[110px] text-xs"
                        value={session.endTime}
                        onChange={(e) =>
                          updateCreateSession(session.id, "endTime", e.target.value)
                        }
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 text-[#C03A3A]"
                      onClick={() => removeCreateSession(session.id)}
                      aria-label={t("cohort_session_remove")}
                    >
                      <Minus className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit border-[#CDEBE8]"
                  onClick={addCreateSession}
                >
                  <Plus className="size-4" />
                  {t("cohort_session_add")}
                </Button>
              </div>
            </fieldset>

            <label
              htmlFor={`cohort-message-${program.id}`}
              className="grid gap-1.5 text-sm font-medium md:col-span-2"
            >
              {t("invite_message")}
              <Textarea id={`cohort-message-${program.id}`} name="inviteMessage" />
            </label>

            {/* 費用設定 */}
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">{t("cohort_fee_title")}</legend>
              <div className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="feeTypeRadio"
                    className="size-4 accent-[#0D7773]"
                    checked={createFeeType === "free"}
                    onChange={() => setCreateFeeType("free")}
                  />
                  {t("cohort_fee_type_free")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="feeTypeRadio"
                    className="size-4 accent-[#0D7773]"
                    checked={createFeeType === "paid"}
                    onChange={() => setCreateFeeType("paid")}
                  />
                  {t("cohort_fee_type_paid")}
                </label>
                {createFeeType === "paid" && (
                  <Input
                    name="feeAmount"
                    type="number"
                    min={0}
                    className="h-9 w-[120px]"
                    placeholder={t("cohort_fee_amount")}
                  />
                )}
              </div>
            </fieldset>

            {/* 報名設定 */}
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">{t("cohort_signup_title")}</legend>
              <div className="mt-2 grid gap-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="signupMethodRadio"
                      className="size-4 accent-[#0D7773]"
                      checked={createSignupMethod === "island_form"}
                      onChange={() => setCreateSignupMethod("island_form")}
                    />
                    {t("cohort_signup_method_island_form")}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="signupMethodRadio"
                      className="size-4 accent-[#0D7773]"
                      checked={createSignupMethod === "external"}
                      onChange={() => setCreateSignupMethod("external")}
                    />
                    {t("cohort_signup_method_external")}
                  </label>
                </div>
                {createSignupMethod === "external" && (
                  <Input
                    name="externalSignupUrl"
                    type="url"
                    placeholder={t("cohort_external_signup_url_placeholder")}
                  />
                )}
                <label className="flex items-center gap-3 text-sm">
                  <input
                    name="showInviteMessageOnSignup"
                    type="checkbox"
                    className="size-4 accent-[#0D7773]"
                  />
                  {t("cohort_show_invite_message_on_signup")}
                </label>
              </div>
            </fieldset>

            {/* 隱私設定 */}
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">{t("cohort_privacy_title")}</legend>
              <div className="mt-2 grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{t("cohort_is_private")}</p>
                    <p className="text-xs text-[#78928F]">{t("cohort_is_private_hint")}</p>
                  </div>
                  <Switch checked={createIsPrivate} onCheckedChange={setCreateIsPrivate} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{t("cohort_checkin_default_private")}</p>
                    <p className="text-xs text-[#78928F]">
                      {t("cohort_checkin_default_private_hint")}
                    </p>
                  </div>
                  <Switch
                    checked={createCheckinPrivate}
                    onCheckedChange={setCreateCheckinPrivate}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{t("cohort_host_comment_default_private")}</p>
                    <p className="text-xs text-[#78928F]">
                      {t("cohort_host_comment_default_private_hint")}
                    </p>
                  </div>
                  <Switch
                    checked={createHostCommentPrivate}
                    onCheckedChange={setCreateHostCommentPrivate}
                  />
                </div>
              </div>
            </fieldset>

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
            <div className="grid gap-1.5 md:col-span-2">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input name="visibility" type="checkbox" className="size-4 accent-[#0D7773]" />
                {t("cohort_visibility_public")}
              </label>
              <p className="text-xs text-[#78928F]">{t("cohort_visibility_hint")}</p>
            </div>
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
          <Textarea name="description" placeholder={t("program_description")} />
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
