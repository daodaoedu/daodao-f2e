"use client";

import {
  archiveLighthouseCohort,
  archiveLighthouseProgram,
  createLighthouseCohort,
  createLighthouseProgram,
  duplicateLighthouseCohort,
  duplicateLighthouseProgram,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { Input } from "@daodao/ui/components/input";
import { toast } from "@daodao/ui/components/sonner";
import { Switch } from "@daodao/ui/components/switch";
import { Textarea } from "@daodao/ui/components/textarea";
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Copy,
  Minus,
  MoreVertical,
  Pencil,
  Plus,
  RadioTower,
  Search,
  Send,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { JoinCode } from "./join-code";

type SessionEntry = { id: string; sessionDate: string; startTime: string; endTime: string };

type CohortTemplateSummary = { id: number; title: string; boundCohortIds: number[] };

/** 已封存要一眼看得出來，不能和草稿、已發佈長一樣 */
const COHORT_STATUS_STYLES: Record<LighthouseCohortType["status"], string> = {
  draft: "bg-[#F1F4F4] text-[#5A7B79]",
  published: "bg-[#EDF8F6] text-[#0D7773]",
  archived: "bg-[#FDECEC] text-[#C03A3A]",
};

type SetupTab = "basic" | "templates" | "home" | "privacy" | "signup";
const SETUP_TABS: SetupTab[] = ["basic", "templates", "home", "privacy", "signup"];

interface CohortSetupPanelProps {
  mode: "create" | "edit";
  cohort?: LighthouseCohortType;
  programId: number;
  organizationId: number;
  templates?: CohortTemplateSummary[];
  onSubmit: (
    formData: FormData,
    extras: {
      interactionModes: string[];
      sessions: SessionEntry[];
      feeType: "free" | "paid";
      signupMethod: "island_form" | "external";
      isPrivate: boolean;
      checkinDefaultPrivate: boolean;
      hostCommentDefaultPrivate: boolean;
      visibility: "public" | "private";
      selectedTemplateIds?: number[];
      publishNow?: boolean;
    }
  ) => Promise<void>;
  onClose: () => void;
  busy: boolean;
}

function CohortSetupPanel({
  mode,
  cohort,
  programId,
  organizationId: _organizationId,
  templates,
  onSubmit,
  onClose,
  busy,
}: CohortSetupPanelProps) {
  const t = useTranslations("lighthouse");
  const [activeTab, setActiveTab] = useState<SetupTab>("basic");
  const panelRef = useRef<HTMLFormElement>(null);
  const selectedTemplatesRef = useRef<Set<number>>(new Set());

  const [sessions, setSessions] = useState<SessionEntry[]>(() =>
    (cohort?.sessions ?? []).map((s, i) => ({
      id: String(s.id ?? i),
      sessionDate: s.sessionDate?.slice(0, 10) ?? "",
      startTime: s.startTime ?? "",
      endTime: s.endTime ?? "",
    }))
  );
  const [interactionModes, setInteractionModes] = useState<string[]>(
    cohort?.interactionModes ?? []
  );
  const [feeType, setFeeType] = useState<"free" | "paid">(cohort?.feeType ?? "free");
  const [signupMethod, setSignupMethod] = useState<"island_form" | "external">(
    cohort?.signupMethod ?? "island_form"
  );
  const [isPrivate, setIsPrivate] = useState(cohort?.isPrivate ?? true);
  const [checkinPrivate, setCheckinPrivate] = useState(cohort?.checkinDefaultPrivate ?? false);
  const [hostCommentPrivate, setHostCommentPrivate] = useState(
    cohort?.hostCommentDefaultPrivate ?? false
  );
  const [publishNow, setPublishNow] = useState(false);
  const [taglineValue, setTaglineValue] = useState(cohort?.tagline ?? "");
  const [capacityUnlimited, setCapacityUnlimited] = useState(!cohort?.capacity);
  const [interactionDropdownOpen, setInteractionDropdownOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">(
    cohort?.visibility ?? "private"
  );
  const [showInviteOnSignup, setShowInviteOnSignup] = useState(
    cohort?.showInviteMessageOnSignup ?? false
  );

  useEffect(() => {
    panelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: mode === "edit" ? "start" : "nearest",
    });
  }, [mode]);

  const addSession = useCallback(() => {
    setSessions((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          sessionDate: "",
          startTime: last?.startTime ?? "",
          endTime: last?.endTime ?? "",
        },
      ];
    });
  }, []);
  const removeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);
  const updateSession = useCallback((id: string, field: keyof SessionEntry, value: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }, []);
  const toggleInteractionMode = useCallback((m: string) => {
    setInteractionModes((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }, []);

  function handleIsPrivateChange(checked: boolean) {
    setIsPrivate(checked);
    if (!checked) {
      setCheckinPrivate(false);
      setHostCommentPrivate(false);
    }
  }

  const filteredTemplates =
    templates?.filter((tpl) => tpl.title.toLowerCase().includes(templateSearch.toLowerCase())) ??
    [];

  async function handleFormAction(formData: FormData) {
    await onSubmit(formData, {
      interactionModes,
      sessions,
      feeType,
      signupMethod,
      isPrivate,
      checkinDefaultPrivate: checkinPrivate,
      hostCommentDefaultPrivate: hostCommentPrivate,
      visibility,
      selectedTemplateIds: Array.from(selectedTemplatesRef.current),
      publishNow,
    });
  }

  const tabDisabled = mode === "create";
  const prefix = cohort ? `edit-${cohort.id}` : `create-${programId}`;

  return (
    <form
      ref={panelRef}
      action={handleFormAction}
      className="scroll-mt-24 rounded-2xl border border-[#CDEBE8] bg-[#F0FBF9] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold">
          {mode === "create" ? t("cohort_create_title") : t("cohort_setup_title")}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onClose}
          aria-label={t("close")}
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Pill tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5" role="tablist">
        {SETUP_TABS.map((tab) => {
          const disabled = tabDisabled && tab !== "basic";
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-disabled={disabled}
              title={disabled ? t("cohort_tab_disabled_tooltip") : undefined}
              onClick={() => !disabled && setActiveTab(tab)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#16B9B3] text-white"
                  : disabled
                    ? "cursor-not-allowed text-[#5A7B79] opacity-50"
                    : "text-[#5A7B79] hover:bg-[#F0FBF9]"
              }`}
            >
              {t(`cohort_tab_${tab}`)}
            </button>
          );
        })}
      </div>

      {/* Tab: basic */}
      <div className={activeTab !== "basic" ? "hidden" : ""} role="tabpanel">
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor={`${prefix}-name`} className="grid gap-1.5 text-sm font-medium">
            {t("cohort_display_name")}
            <Input
              id={`${prefix}-name`}
              name="displayName"
              required
              defaultValue={cohort?.displayName ?? ""}
            />
          </label>
          {mode === "create" && (
            <label htmlFor={`${prefix}-slug`} className="grid gap-1.5 text-sm font-medium">
              {t("cohort_slug")}
              <Input
                id={`${prefix}-slug`}
                name="slug"
                required
                pattern="[a-z0-9-]+"
                placeholder="2026-summer"
              />
            </label>
          )}
          <div className="grid gap-1.5 text-sm font-medium md:col-span-2">
            <label htmlFor={`${prefix}-tagline`}>{t("cohort_tagline")}</label>
            <Textarea
              id={`${prefix}-tagline`}
              name="tagline"
              rows={3}
              placeholder={t("cohort_tagline_placeholder")}
              value={taglineValue}
              onChange={(e) => setTaglineValue(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#78928F]">{t("cohort_tagline_description")}</p>
              <p
                className={`text-xs ${taglineValue.length > 80 ? "text-[#C03A3A] font-medium" : "text-[#78928F]"}`}
              >
                {taglineValue.length} / 80
              </p>
            </div>
          </div>
          <label htmlFor={`${prefix}-start`} className="grid gap-1.5 text-sm font-medium">
            {t("start_date")}
            <Input
              id={`${prefix}-start`}
              name="startDate"
              type="date"
              required
              defaultValue={cohort?.startDate?.slice(0, 10) ?? ""}
            />
          </label>
          <label htmlFor={`${prefix}-end`} className="grid gap-1.5 text-sm font-medium">
            {t("end_date")}
            <Input
              id={`${prefix}-end`}
              name="endDate"
              type="date"
              required
              defaultValue={cohort?.endDate?.slice(0, 10) ?? ""}
            />
          </label>
          <label htmlFor={`${prefix}-deadline`} className="grid gap-1.5 text-sm font-medium">
            {t("join_deadline")}
            <Input
              id={`${prefix}-deadline`}
              name="joinDeadline"
              type="date"
              defaultValue={cohort?.joinDeadline?.slice(0, 10) ?? ""}
            />
          </label>
          <div className="grid gap-1.5 text-sm font-medium">
            <label htmlFor={`${prefix}-capacity`}>{t("capacity")}</label>
            <div className="flex items-center gap-2">
              <Input
                id={`${prefix}-capacity`}
                name="capacity"
                type="number"
                min={1}
                disabled={capacityUnlimited}
                placeholder={capacityUnlimited ? t("cohort_capacity_unlimited") : ""}
                defaultValue={capacityUnlimited ? "" : (cohort?.capacity ?? "")}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setCapacityUnlimited(!capacityUnlimited)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  capacityUnlimited
                    ? "bg-[#16B9B3] text-white"
                    : "bg-[#F1F4F4] text-[#5A7B79] hover:bg-[#E7FAF7]"
                }`}
              >
                {t("cohort_capacity_unlimited")}
              </button>
            </div>
          </div>

          {/* 互動方式 */}
          <div className="relative md:col-span-2">
            <p className="mb-1.5 text-sm font-medium">{t("cohort_interaction_modes")}</p>
            <button
              type="button"
              onClick={() => setInteractionDropdownOpen(!interactionDropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-[#CDEBE8] bg-white px-3 py-2.5 text-sm text-left"
            >
              <span className={interactionModes.length ? "text-[#0D3036]" : "text-[#78928F]"}>
                {interactionModes.length
                  ? interactionModes.map((m) => t(`cohort_interaction_mode_${m}`)).join("、")
                  : t("cohort_interaction_modes_placeholder")}
              </span>
              <ChevronDown
                className={`size-4 text-[#78928F] transition-transform ${interactionDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {interactionDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-[#CDEBE8] bg-white shadow-lg">
                {(["sync", "async", "physical"] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 ${
                      interactionModes.includes(mode) ? "bg-[#F0FBF9]" : "hover:bg-[#FAFCFC]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-[#16B9B3]"
                      checked={interactionModes.includes(mode)}
                      onChange={() => toggleInteractionMode(mode)}
                    />
                    <div>
                      <p className="text-sm font-medium">{t(`cohort_interaction_mode_${mode}`)}</p>
                      <p className="text-xs text-[#78928F]">
                        {t(`cohort_interaction_mode_${mode}_desc`)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {interactionModes.includes("sync") && (
            <label htmlFor={`${prefix}-meeting`} className="grid gap-1.5 text-sm font-medium">
              {t("cohort_meeting_url")}
              <Input
                id={`${prefix}-meeting`}
                name="meetingUrl"
                type="url"
                placeholder={t("cohort_meeting_url_placeholder")}
                defaultValue={cohort?.meetingUrl ?? ""}
              />
            </label>
          )}
          {interactionModes.includes("physical") && (
            <label htmlFor={`${prefix}-location`} className="grid gap-1.5 text-sm font-medium">
              {t("cohort_location")}
              <Input
                id={`${prefix}-location`}
                name="location"
                placeholder={t("cohort_location_placeholder")}
                defaultValue={cohort?.location ?? ""}
              />
            </label>
          )}

          {/* 聚會時段 */}
          {(interactionModes.includes("sync") || interactionModes.includes("physical")) && (
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">{t("cohort_sessions_title")}</legend>
              <div className="mt-2 grid gap-2">
                {sessions.map((session) => (
                  <div key={session.id} className="flex flex-wrap items-end gap-2">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1 text-xs">
                      {t("cohort_session_date")}
                      <Input
                        type="date"
                        className="h-9 w-[140px] text-xs"
                        value={session.sessionDate}
                        onChange={(e) => updateSession(session.id, "sessionDate", e.target.value)}
                      />
                    </label>
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1 text-xs">
                      {t("cohort_session_start_time")}
                      <Input
                        type="time"
                        className="h-9 w-[110px] text-xs"
                        value={session.startTime}
                        onChange={(e) => updateSession(session.id, "startTime", e.target.value)}
                      />
                    </label>
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1 text-xs">
                      {t("cohort_session_end_time")}
                      <Input
                        type="time"
                        className="h-9 w-[110px] text-xs"
                        value={session.endTime}
                        onChange={(e) => updateSession(session.id, "endTime", e.target.value)}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 text-[#C03A3A]"
                      onClick={() => removeSession(session.id)}
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
                  onClick={addSession}
                >
                  <Plus className="size-4" />
                  {t("cohort_session_add")}
                </Button>
              </div>
            </fieldset>
          )}

          {/* 費用設定 */}
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-medium">{t("cohort_fee_title")}</legend>
            <div className="mt-2">
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as "free" | "paid")}
                className="rounded-lg border border-[#CDEBE8] bg-white px-3 py-2 text-sm"
              >
                <option value="free">{t("cohort_fee_type_free")}</option>
                <option value="paid">{t("cohort_fee_type_paid")}</option>
              </select>
              {feeType === "paid" && (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                  <label className="grid gap-1.5 text-sm font-medium">
                    {t("cohort_fee_amount")} (NT$/人)
                    <Input
                      name="feeAmount"
                      type="number"
                      min={0}
                      required
                      defaultValue={cohort?.feeAmount ?? ""}
                    />
                  </label>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                  <label className="grid gap-1.5 text-sm font-medium">
                    {t("cohort_external_signup_url_label")}
                    <Input
                      name="externalSignupUrl"
                      type="url"
                      required
                      placeholder="https://"
                      defaultValue={cohort?.externalSignupUrl ?? ""}
                    />
                  </label>
                </div>
              )}
              {feeType === "free" && (
                <div className="mt-3 grid gap-2">
                  <select
                    value={signupMethod}
                    onChange={(e) => setSignupMethod(e.target.value as "island_form" | "external")}
                    className="rounded-lg border border-[#CDEBE8] bg-white px-3 py-2 text-sm"
                  >
                    <option value="island_form">{t("cohort_signup_method_island_form")}</option>
                    <option value="external">{t("cohort_signup_method_external")}</option>
                  </select>
                  {signupMethod === "external" && (
                    <Input
                      name="externalSignupUrl"
                      type="url"
                      required
                      placeholder="https://"
                      defaultValue={cohort?.externalSignupUrl ?? ""}
                    />
                  )}
                </div>
              )}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Tab: templates */}
      <div className={activeTab !== "templates" ? "hidden" : ""} role="tabpanel">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t("cohort_select_templates")}</p>
            <p className="mt-0.5 text-xs text-[#78928F]">{t("cohort_select_templates_hint")}</p>
          </div>
          <p className="text-xs text-[#78928F]">
            {t("cohort_templates_linked_count", { count: selectedTemplatesRef.current.size })}
          </p>
        </div>
        {templates && templates.length > 0 ? (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#78928F]" />
              <Input
                placeholder={t("cohort_template_search_placeholder")}
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {filteredTemplates.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredTemplates.map((tpl) => {
                  const bound = cohort ? tpl.boundCohortIds.includes(cohort.id) : true;
                  return (
                    <label
                      key={tpl.id}
                      className="flex items-center gap-3 rounded-xl border border-[#DDEFED] px-4 py-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={bound}
                        className="size-4 accent-[#0D7773]"
                        onChange={(e) => {
                          if (e.target.checked) selectedTemplatesRef.current.add(tpl.id);
                          else selectedTemplatesRef.current.delete(tpl.id);
                        }}
                        ref={(el) => {
                          if (el && bound) selectedTemplatesRef.current.add(tpl.id);
                        }}
                      />
                      {tpl.title}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[#5A7B79]">
                {t("cohort_templates_search_empty")}
              </p>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-sm text-[#5A7B79]">
            {t("cohort_no_templates_available")}
          </p>
        )}
      </div>

      {/* Tab: home (placeholder) */}
      <div className={activeTab !== "home" ? "hidden" : ""} role="tabpanel">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[#5A7B79]">{t("cohort_home_page_coming_soon")}</p>
        </div>
      </div>

      {/* Tab: privacy */}
      <div className={activeTab !== "privacy" ? "hidden" : ""} role="tabpanel">
        <p className="mb-1 text-sm font-medium">{t("cohort_privacy_title")}</p>
        <p className="mb-3 text-xs text-[#78928F]">{t("cohort_privacy_description")}</p>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
        >
          {[
            {
              label: t("cohort_is_private"),
              hint: t("cohort_is_private_hint"),
              checked: isPrivate,
              onChange: handleIsPrivateChange,
              disabled: false,
              dimmed: false,
            },
            {
              label: t("cohort_checkin_default_private"),
              hint: isPrivate
                ? t("cohort_checkin_default_private_hint")
                : t("cohort_privacy_disabled_hint"),
              checked: checkinPrivate,
              onChange: setCheckinPrivate,
              disabled: !isPrivate,
              dimmed: !isPrivate,
            },
            {
              label: t("cohort_host_comment_default_private"),
              hint: isPrivate
                ? t("cohort_host_comment_default_private_hint")
                : t("cohort_privacy_disabled_hint"),
              checked: hostCommentPrivate,
              onChange: setHostCommentPrivate,
              disabled: !isPrivate,
              dimmed: !isPrivate,
            },
            {
              label: t("cohort_visibility_public"),
              hint: t("cohort_visibility_hint"),
              checked: visibility === "public",
              onChange: (v: boolean) => setVisibility(v ? "public" : "private"),
              disabled: false,
              dimmed: false,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border border-[#DDEFED] p-4 transition-opacity ${item.dimmed ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.label}</p>
                <Switch
                  checked={item.checked}
                  onCheckedChange={item.onChange}
                  disabled={item.disabled}
                />
              </div>
              <p className="mt-1 text-xs text-[#78928F]">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab: signup */}
      <div className={activeTab !== "signup" ? "hidden" : ""} role="tabpanel">
        <label className="mb-2 flex items-center gap-3 text-sm">
          <input
            name="showInviteMessageOnSignup"
            type="checkbox"
            className="size-4 accent-[#0D7773]"
            checked={showInviteOnSignup}
            onChange={(e) => setShowInviteOnSignup(e.target.checked)}
          />
          {t("cohort_show_invite_message_on_signup")}
        </label>
        <label htmlFor={`${prefix}-message`} className="grid gap-1.5 text-sm font-medium">
          {t("invite_message")}
          <Textarea
            id={`${prefix}-message`}
            name="inviteMessage"
            rows={3}
            disabled={!showInviteOnSignup}
            placeholder={
              showInviteOnSignup
                ? t("cohort_invite_message_placeholder")
                : t("cohort_invite_message_disabled_placeholder")
            }
            defaultValue={cohort?.inviteMessage ?? ""}
          />
        </label>
        <div className="mt-6 rounded-xl border border-dashed border-[#B9DCD8] p-5 text-center">
          <p className="text-sm text-[#5A7B79]">{t("cohort_signup_questions_coming_soon")}</p>
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-[#B9DCD8] p-5 text-center">
          <p className="text-sm text-[#5A7B79]">{t("cohort_signup_preview_coming_soon")}</p>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="mt-5 flex items-center justify-end gap-3">
        {mode === "create" && (
          <span className="flex items-center gap-2 text-sm">
            <Switch checked={publishNow} onCheckedChange={setPublishNow} />
            {t("publish_now")}
          </span>
        )}
        <Button type="submit" disabled={busy}>
          {mode === "create" ? t("cohort_create") : t("save")}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}

interface CohortCardProps {
  programId: number;
  organizationId: number;
  cohort: LighthouseCohortType;
  templates?: CohortTemplateSummary[];
  refresh: () => Promise<unknown>;
}

function CohortCard({ programId, organizationId, cohort, templates, refresh }: CohortCardProps) {
  const t = useTranslations("lighthouse");
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState(searchParams.get("edit") === String(cohort.id));
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

  async function handleDuplicate() {
    setBusy(true);
    const response = await duplicateLighthouseCohort(programId, cohort.id);
    setBusy(false);
    if (response.error) {
      toast.error(t("cohort_duplicate_failed"));
      return;
    }
    toast.success(t("cohort_duplicated", { name: response.data.data.displayName }));
    await refresh();
  }

  const handleEditSubmit = useCallback(
    async (formData: FormData, extras: Parameters<CohortSetupPanelProps["onSubmit"]>[1]) => {
      const startDate = String(formData.get("startDate") ?? "");
      const endDate = String(formData.get("endDate") ?? "");
      if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
        toast.error(t("cohort_date_error"));
        return;
      }
      if (extras.interactionModes.length === 0) {
        toast.error(t("cohort_interaction_modes_error"));
        return;
      }
      const capacityValue = String(formData.get("capacity") ?? "");
      const feeAmountValue = String(formData.get("feeAmount") ?? "");
      if (extras.feeType === "paid" && !feeAmountValue) {
        toast.error(t("cohort_fee_amount_error"));
        return;
      }
      const externalUrl = String(formData.get("externalSignupUrl") ?? "").trim();
      if (extras.signupMethod === "external" && !externalUrl) {
        toast.error(t("cohort_external_signup_url_error"));
        return;
      }
      setBusy(true);
      const response = await updateLighthouseCohort(programId, cohort.id, {
        displayName: String(formData.get("displayName") ?? "").trim(),
        tagline: String(formData.get("tagline") ?? "").trim() || null,
        startDate,
        endDate,
        joinDeadline: String(formData.get("joinDeadline") ?? "") || null,
        capacity: capacityValue ? Number(capacityValue) : null,
        inviteMessage: String(formData.get("inviteMessage") ?? "").trim() || null,
        visibility: extras.visibility,
        interactionModes: extras.interactionModes as ("sync" | "async" | "physical")[],
        meetingUrl: String(formData.get("meetingUrl") ?? "").trim() || null,
        location: String(formData.get("location") ?? "").trim() || null,
        sessions: extras.sessions
          .filter((s) => s.sessionDate)
          .map((s) => ({
            sessionDate: s.sessionDate,
            startTime: s.startTime || null,
            endTime: s.endTime || null,
          })),
        feeType: extras.feeType,
        feeAmount: extras.feeType === "paid" && feeAmountValue ? Number(feeAmountValue) : null,
        signupMethod: extras.signupMethod,
        externalSignupUrl:
          extras.signupMethod === "external" || extras.feeType === "paid"
            ? externalUrl || null
            : null,
        showInviteMessageOnSignup: formData.get("showInviteMessageOnSignup") === "on",
        isPrivate: extras.isPrivate,
        checkinDefaultPrivate: extras.checkinDefaultPrivate,
        hostCommentDefaultPrivate: extras.hostCommentDefaultPrivate,
      } as Parameters<typeof updateLighthouseCohort>[2]);
      setBusy(false);
      if (response.error) {
        toast.error(t("save_failed"));
        return;
      }
      await refresh();
      setEditing(false);
      toast.success(t("cohort_saved"));
    },
    [programId, cohort.id, refresh, t]
  );

  const missingTemplates =
    templates && !templates.some((tpl) => tpl.boundCohortIds.includes(cohort.id));

  if (editing) {
    return (
      <CohortSetupPanel
        mode="edit"
        cohort={cohort}
        programId={programId}
        organizationId={organizationId}
        templates={templates}
        onSubmit={handleEditSubmit}
        onClose={() => setEditing(false)}
        busy={busy}
      />
    );
  }

  return (
    <div
      id={`cohort-${cohort.id}`}
      className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-[#DDEFED] px-5 py-4 lg:flex-row lg:items-start"
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
          {missingTemplates && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6E8] px-2.5 py-1 text-[10px] font-semibold text-[#A95D00]">
              <AlertTriangle className="size-3" />
              {t("cohort_no_templates_warning")}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-[#78928F]">
          {cohort.startDate.slice(0, 10)} — {cohort.endDate.slice(0, 10)} · /{cohort.slug} ·{" "}
          {cohort.isPrivate ? t("cohort_info_private") : t("cohort_info_public_activity")} ·{" "}
          {cohort.feeType === "paid"
            ? t("cohort_info_fee_paid", { amount: cohort.feeAmount ?? 0 })
            : t("cohort_info_fee_free")}
        </p>
        {cohort.joinToken && (
          <div className="mt-2">
            <JoinCode joinToken={cohort.joinToken} />
            {cohort.status === "published" && (
              <CustomLink
                href={`/lighthouse/programs/${programId}/cohorts/${cohort.id}/roster`}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#CDEBE8] px-3 py-1.5 text-xs font-medium text-[#0D5B59] hover:bg-[#EDF8F6]"
              >
                <Send className="size-3.5" aria-hidden="true" />
                {t("cohort_invite_by_email")}
              </CustomLink>
            )}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {cohort.status === "draft" && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handlePublish}
            disabled={busy}
            aria-label={t("cohort_publish")}
            title={t("cohort_publish")}
          >
            <Send className="size-4" aria-hidden="true" />
          </Button>
        )}
        {cohort.status !== "archived" && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setEditing(true)}
            disabled={busy}
            aria-label={t("edit")}
            title={t("edit")}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
        )}
        <CustomLink
          href={`/lighthouse/programs/${programId}/cohorts/${cohort.id}/dashboard`}
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

  async function handleProgramDuplicate() {
    setBusy(true);
    const response = await duplicateLighthouseProgram(program.id);
    setBusy(false);
    if (response.error) {
      toast.error(t("program_duplicate_failed"));
      return;
    }
    toast.success(t("program_duplicated"));
    await refreshPrograms();
  }

  const handleCohortCreate = useCallback(
    async (formData: FormData, extras: Parameters<CohortSetupPanelProps["onSubmit"]>[1]) => {
      const startDate = String(formData.get("startDate") ?? "");
      const endDate = String(formData.get("endDate") ?? "");
      if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
        toast.error(t("cohort_date_error"));
        return;
      }
      if (extras.interactionModes.length === 0) {
        toast.error(t("cohort_interaction_modes_error"));
        return;
      }
      const capacityValue = String(formData.get("capacity") ?? "");
      const feeAmountValue = String(formData.get("feeAmount") ?? "");
      if (extras.feeType === "paid" && !feeAmountValue) {
        toast.error(t("cohort_fee_amount_error"));
        return;
      }
      const externalUrl = String(formData.get("externalSignupUrl") ?? "").trim();
      if (extras.signupMethod === "external" && !externalUrl) {
        toast.error(t("cohort_external_signup_url_error"));
        return;
      }
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
        status: extras.publishNow ? "published" : "draft",
        visibility: extras.visibility,
        interactionModes: extras.interactionModes as ("sync" | "async" | "physical")[],
        meetingUrl: String(formData.get("meetingUrl") ?? "").trim() || undefined,
        location: String(formData.get("location") ?? "").trim() || undefined,
        sessions: extras.sessions
          .filter((s) => s.sessionDate)
          .map((s) => ({
            sessionDate: s.sessionDate,
            startTime: s.startTime || undefined,
            endTime: s.endTime || undefined,
          })),
        feeType: extras.feeType,
        feeAmount: extras.feeType === "paid" && feeAmountValue ? Number(feeAmountValue) : undefined,
        signupMethod: extras.signupMethod,
        externalSignupUrl:
          extras.signupMethod === "external" || extras.feeType === "paid"
            ? externalUrl || undefined
            : undefined,
        showInviteMessageOnSignup: formData.get("showInviteMessageOnSignup") === "on",
        isPrivate: extras.isPrivate,
        checkinDefaultPrivate: extras.checkinDefaultPrivate,
        hostCommentDefaultPrivate: extras.hostCommentDefaultPrivate,
      } as Parameters<typeof createLighthouseCohort>[1]);
      if (response.error || !response.data) {
        setBusy(false);
        toast.error(t("cohort_create_failed"));
        return;
      }
      const newCohortId = (response.data as { data: { id: number } }).data.id;
      const templateIds = extras.selectedTemplateIds ?? [];
      await Promise.all(
        templateIds.map((templateId) =>
          setLighthouseTemplateBinding(program.organizationId, templateId, newCohortId, true)
        )
      );
      setBusy(false);
      await mutate();
      setCreatingCohort(false);
      toast.success(t("cohort_created"));
    },
    [program.id, program.organizationId, mutate, t]
  );

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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {t("edit")}
            </Button>
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
                <DropdownMenuItem
                  onClick={handleProgramDuplicate}
                  disabled={busy}
                  className="gap-2"
                >
                  <Copy className="size-4" aria-hidden="true" />
                  {t("program_duplicate")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleArchive}
                  disabled={busy}
                  className="gap-2 text-[#C03A3A]"
                >
                  <Archive className="size-4" aria-hidden="true" />
                  {t("archive")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <div className="mt-5">
            <CohortSetupPanel
              mode="create"
              programId={program.id}
              organizationId={program.organizationId}
              templates={templates}
              onSubmit={handleCohortCreate}
              onClose={() => setCreatingCohort(false)}
              busy={busy}
            />
          </div>
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
              organizationId={program.organizationId}
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
