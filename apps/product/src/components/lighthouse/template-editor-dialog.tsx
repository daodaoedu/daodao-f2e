"use client";

import {
  type CreateOrganizationTemplateBody,
  createLighthouseTemplate,
  type LighthouseTemplate,
  updateLighthouseTemplate,
} from "@daodao/api";

import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  DURATION_QUICK_OPTIONS,
  deriveTemplateName,
  FREQUENCY_QUICK_OPTIONS,
  formatFrequency,
  MINUTES_QUICK_OPTIONS,
  parseFrequency,
  TEMPLATE_ACTION_MAX,
  TEMPLATE_DAYS_MAX,
  TEMPLATE_MINUTES_MAX,
  TEMPLATE_TAGS_MAX,
  TEMPLATE_TIMING_OTHER_MAX,
  TEMPLATE_TITLE_MAX,
  type TemplateTiming,
  TIMING_OPTIONS,
} from "@/utils/template-library";
import { LIGHTHOUSE_SCOPE } from "./lighthouse-scope";
import { type TemplateResourceDraft, TemplateResourceEditor } from "./template-resource-editor";

type Timing = "" | TemplateTiming | "other";

export interface TemplateDraft {
  action: string;
  name: string;
  nameTouched: boolean;
  days: string;
  frequency: string;
  minutes: string;
  timing: Timing;
  timingOther: string;
  /** 編輯器只呈現第一個時機；其餘既有時機原樣保留，儲存時一併帶回（避免改別的欄位就把它們清掉） */
  extraTimePeriods: TemplateTiming[];
  tags: string[];
  resources: TemplateResourceDraft[];
}

export type TemplateSaveKind = "created" | "updated" | "draft";

interface TemplateEditorDialogProps {
  organizationId: number;
  open: boolean;
  /** 編輯既有模板時帶入；建立時為 null */
  template: LighthouseTemplate | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (template: LighthouseTemplate, kind: TemplateSaveKind) => void;
}

const EMPTY_DRAFT: TemplateDraft = {
  action: "",
  name: "",
  nameTouched: false,
  days: "14",
  frequency: "",
  minutes: "30",
  timing: "",
  timingOther: "",
  extraTimePeriods: [],
  tags: [],
  resources: [],
};

function draftFromTemplate(template: LighthouseTemplate): TemplateDraft {
  const timing = template.practiceTimePeriods[0];
  return {
    action: template.practiceAction ?? "",
    name: template.title,
    nameTouched: true,
    days: template.durationDays ? String(template.durationDays) : "",
    frequency: formatFrequency(template.frequencyMinDays, template.frequencyMaxDays),
    minutes: template.sessionDurationMinutes ? String(template.sessionDurationMinutes) : "",
    timing: template.timingOther
      ? "other"
      : timing && (TIMING_OPTIONS as readonly string[]).includes(timing)
        ? (timing as TemplateTiming)
        : "",
    timingOther: template.timingOther ?? "",
    extraTimePeriods: template.practiceTimePeriods
      .slice(1)
      .filter((period): period is TemplateTiming =>
        (TIMING_OPTIONS as readonly string[]).includes(period)
      ),
    tags: template.tags,
    resources: template.resources.map((resource) => ({
      key: resource.id,
      name: resource.name,
      url: resource.url ?? "",
      dayNumber: resource.dayNumber ?? null,
    })),
  };
}

function hasAnyContent(draft: TemplateDraft): boolean {
  return Boolean(
    draft.action.trim() ||
      draft.name.trim() ||
      draft.tags.length ||
      draft.resources.length ||
      draft.timingOther.trim()
  );
}

/**
 * 建立／編輯模板的 4 步 wizard（FR-TPL-02、FR-TPL-03）：
 * 1 實踐行動 + 自動命名 → 2 天數／每週頻率／每次分鐘／執行時機 → 3 標籤與資源 → 4 預覽。
 * 任一步都可「儲存草稿」（status=draft，至少要有一項內容）。
 */
export function TemplateEditorDialog({
  organizationId,
  open,
  template,
  onOpenChange,
  onSaved,
}: TemplateEditorDialogProps) {
  const t = useTranslations("lighthouse");
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<TemplateDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingName, setEditingName] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setErrors({});
    setEditingName(false);
    setTagInput("");
    setDraft(template ? draftFromTemplate(template) : EMPTY_DRAFT);
  }, [open, template]);

  const derivedName = useMemo(() => deriveTemplateName(draft.action), [draft.action]);
  const displayName = draft.nameTouched && draft.name.trim() ? draft.name.trim() : derivedName;
  const frequency = parseFrequency(draft.frequency);
  const daysNumber = Number(draft.days);
  const minutesNumber = Number(draft.minutes);

  function patch(next: Partial<TemplateDraft>) {
    setDraft((current) => ({ ...current, ...next }));
    // 使用者修正欄位後立刻清掉該欄位的錯誤，不必等再按一次下一步
    setErrors((current) => {
      const keys = Object.keys(next).filter((key) => key in current);
      if (keys.length === 0) return current;
      const cleared = { ...current };
      for (const key of keys) delete cleared[key];
      return cleared;
    });
  }

  function validateStep(target: number): boolean {
    const next: Record<string, string> = {};
    if (target >= 1 && !draft.action.trim()) next.action = t("template_action_required");
    if (target >= 2) {
      if (
        !draft.days.trim() ||
        !Number.isInteger(daysNumber) ||
        daysNumber < 1 ||
        daysNumber > TEMPLATE_DAYS_MAX
      )
        next.days = t("template_days_error", { max: TEMPLATE_DAYS_MAX });
      if (!frequency) next.frequency = t("template_frequency_error");
      if (
        draft.minutes.trim() &&
        (!Number.isInteger(minutesNumber) ||
          minutesNumber < 1 ||
          minutesNumber > TEMPLATE_MINUTES_MAX)
      )
        next.minutes = t("template_minutes_error", { max: TEMPLATE_MINUTES_MAX });
      if (draft.timing === "other" && !draft.timingOther.trim())
        next.timingOther = t("template_timing_other_required");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(4, current + 1));
  }

  function buildBody(status: "draft" | "ready"): CreateOrganizationTemplateBody {
    const timingIsPeriod = draft.timing !== "" && draft.timing !== "other";
    return {
      title: displayName || undefined,
      practiceAction: draft.action.trim() || null,
      durationDays: draft.days.trim() && Number.isInteger(daysNumber) ? daysNumber : null,
      frequencyMinDays: frequency?.min ?? null,
      frequencyMaxDays: frequency?.max ?? null,
      sessionDurationMinutes:
        draft.minutes.trim() && Number.isInteger(minutesNumber) ? minutesNumber : null,
      practiceTimePeriods: timingIsPeriod
        ? [draft.timing as TemplateTiming, ...draft.extraTimePeriods]
        : draft.extraTimePeriods,
      timingOther: draft.timing === "other" ? draft.timingOther.trim() || null : null,
      tags: draft.tags,
      resources: draft.resources.map((resource) => ({
        name: resource.name,
        ...(resource.url ? { url: resource.url } : {}),
        ...(resource.dayNumber != null ? { dayNumber: resource.dayNumber } : {}),
      })),
      status,
    };
  }

  async function submit(status: "draft" | "ready") {
    if (status === "ready" && !validateStep(2)) {
      setStep(draft.action.trim() ? 2 : 1);
      return;
    }
    if (status === "draft" && !hasAnyContent(draft)) {
      setErrors({ action: t("template_draft_needs_content") });
      setStep(1);
      return;
    }
    setBusy(true);
    const body = buildBody(status);
    const response = template
      ? await updateLighthouseTemplate(organizationId, template.id, body)
      : await createLighthouseTemplate(organizationId, body);
    setBusy(false);
    if (response.error) {
      toast.error(response.error.error?.message ?? t("save_failed"));
      return;
    }
    onSaved(response.data.data, status === "draft" ? "draft" : template ? "updated" : "created");
  }

  function addTag(raw: string) {
    const pieces = raw
      .split(/[、,，]/)
      .map((piece) => piece.trim())
      .filter(Boolean);
    if (pieces.length === 0) return;
    patch({
      tags: Array.from(new Set([...draft.tags, ...pieces])).slice(0, TEMPLATE_TAGS_MAX),
    });
    setTagInput("");
  }

  const summaryMeta = [
    draft.days.trim() ? t("template_preview_days", { days: draft.days.trim() }) : null,
    frequency ? t("template_preview_frequency", { range: draft.frequency.trim() }) : null,
    draft.minutes.trim() ? t("template_preview_minutes", { minutes: draft.minutes.trim() }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const timingLabel =
    draft.timing === "other"
      ? draft.timingOther.trim()
      : draft.timing
        ? t(`time_period_${draft.timing}`)
        : "";

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent
        overlayClassName="bg-[#0F3036]/30"
        className={cn(
          "flex max-h-[calc(100vh-48px)] w-[min(680px,94vw)] sm:max-w-none flex-col gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0",
          LIGHTHOUSE_SCOPE
        )}
        data-testid="template-editor"
      >
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[#DDEFED] bg-[#F7FCFB] px-5 py-4">
          <button
            type="button"
            className="justify-self-start text-sm text-[#5A7B79] hover:text-[#0D3036]"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {t("cancel")}
          </button>
          <div className="text-center">
            <DialogTitle className="text-base font-semibold text-[#0D3036]">
              {step === 4
                ? t("template_wizard_preview")
                : template
                  ? t("template_wizard_edit_title")
                  : t("template_wizard_title")}
            </DialogTitle>
            {step < 4 && (
              <p className="mt-0.5 text-xs text-[#78928F]">{t("template_wizard_step", { step })}</p>
            )}
            <DialogDescription className="sr-only">{t("template_wizard_title")}</DialogDescription>
          </div>
          <button
            type="button"
            className="grid size-8 place-items-center justify-self-end rounded-full text-[#5A7B79] hover:bg-[#EDF8F6]"
            aria-label={t("close")}
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>
        {step < 4 && (
          <div className="grid grid-cols-4 gap-1.5 px-5 pt-4" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={cn("h-1 rounded-full", step >= n ? "bg-[#16B9B3]" : "bg-[#DDEFED]")}
              />
            ))}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="template-action" className="text-sm font-medium text-[#456B68]">
                    {t("template_action_label")} <span className="text-[#D86060]">*</span>
                  </label>
                  <span className="text-xs text-[#78928F]">
                    {draft.action.length}/{TEMPLATE_ACTION_MAX}
                  </span>
                </div>
                <Textarea
                  id="template-action"
                  rows={4}
                  maxLength={TEMPLATE_ACTION_MAX}
                  placeholder={t("template_action_placeholder")}
                  value={draft.action}
                  onChange={(event) => patch({ action: event.target.value })}
                  className={cn("mt-2", errors.action && "border-[#E4A6A6]")}
                />
                {errors.action && <p className="mt-1 text-xs text-[#C03A3A]">{errors.action}</p>}
              </div>
              <div className="rounded-2xl bg-[#F7FCFB] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#456B68]">{t("template_name_label")}</p>
                    {editingName ? (
                      <Input
                        autoFocus
                        maxLength={TEMPLATE_TITLE_MAX}
                        value={draft.name}
                        placeholder={derivedName || t("template_name_placeholder")}
                        onChange={(event) => patch({ name: event.target.value, nameTouched: true })}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === "Escape") {
                            event.preventDefault();
                            setEditingName(false);
                          }
                        }}
                        className="mt-1"
                      />
                    ) : (
                      <p
                        className={cn(
                          "mt-1 truncate text-base font-semibold",
                          !displayName && "text-[#9AB0AD]"
                        )}
                      >
                        {displayName || t("template_name_auto_hint")}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-full border-[#CDEBE8]"
                    onClick={() => setEditingName((value) => !value)}
                  >
                    {editingName ? t("template_name_done") : t("template_name_edit")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <SummaryBox name={displayName} action={draft.action} />
              <fieldset>
                <legend className="text-sm font-medium text-[#456B68]">
                  {t("template_days_label")} <span className="text-[#D86060]">*</span>
                </legend>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {DURATION_QUICK_OPTIONS.map((option) => (
                    <QuickOption
                      key={option}
                      active={draft.days === String(option)}
                      onClick={() => patch({ days: String(option) })}
                    >
                      {t("duration_days_option", { days: option })}
                    </QuickOption>
                  ))}
                </div>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={TEMPLATE_DAYS_MAX}
                  placeholder={t("template_days_custom", { max: TEMPLATE_DAYS_MAX })}
                  value={
                    (DURATION_QUICK_OPTIONS as readonly number[]).includes(daysNumber)
                      ? ""
                      : draft.days
                  }
                  onChange={(event) => patch({ days: event.target.value })}
                  className="mt-2"
                />
                {errors.days && <p className="mt-1 text-xs text-[#C03A3A]">{errors.days}</p>}
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium text-[#456B68]">
                  {t("template_frequency_label")} <span className="text-[#D86060]">*</span>
                </legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {FREQUENCY_QUICK_OPTIONS.map((option) => (
                    <QuickOption
                      key={option}
                      active={draft.frequency === option}
                      onClick={() => patch({ frequency: option })}
                    >
                      {t("template_frequency_option", { range: option })}
                    </QuickOption>
                  ))}
                </div>
                <Input
                  maxLength={7}
                  placeholder={t("template_frequency_custom")}
                  value={
                    (FREQUENCY_QUICK_OPTIONS as readonly string[]).includes(draft.frequency)
                      ? ""
                      : draft.frequency
                  }
                  onChange={(event) => patch({ frequency: event.target.value })}
                  className="mt-2"
                />
                {errors.frequency && (
                  <p className="mt-1 text-xs text-[#C03A3A]">{errors.frequency}</p>
                )}
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium text-[#456B68]">
                  {t("template_minutes_label")}
                </legend>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {MINUTES_QUICK_OPTIONS.map((option) => (
                    <QuickOption
                      key={option}
                      active={draft.minutes === String(option)}
                      onClick={() => patch({ minutes: String(option) })}
                    >
                      {t("session_minutes_option", { minutes: option })}
                    </QuickOption>
                  ))}
                </div>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={TEMPLATE_MINUTES_MAX}
                  placeholder={t("template_minutes_custom")}
                  value={
                    (MINUTES_QUICK_OPTIONS as readonly number[]).includes(minutesNumber)
                      ? ""
                      : draft.minutes
                  }
                  onChange={(event) => patch({ minutes: event.target.value })}
                  className="mt-2"
                />
                {errors.minutes && <p className="mt-1 text-xs text-[#C03A3A]">{errors.minutes}</p>}
              </fieldset>
              <div>
                <label htmlFor="template-timing" className="text-sm font-medium text-[#456B68]">
                  {t("template_timing_label")}
                </label>
                <select
                  id="template-timing"
                  value={draft.timing}
                  onChange={(event) => patch({ timing: event.target.value as Timing })}
                  className="mt-2 h-10 w-full rounded-xl border border-[#CDEBE8] bg-white px-3 text-sm text-[#0D3036]"
                >
                  <option value="">{t("template_timing_placeholder")}</option>
                  {TIMING_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t(`time_period_${option}`)}
                    </option>
                  ))}
                  <option value="other">{t("template_timing_other")}</option>
                </select>
                {draft.timing === "other" && (
                  <div className="mt-3">
                    <label
                      htmlFor="template-timing-other"
                      className="text-sm font-medium text-[#456B68]"
                    >
                      {t("template_timing_other_label")}
                    </label>
                    <Input
                      id="template-timing-other"
                      maxLength={TEMPLATE_TIMING_OTHER_MAX}
                      placeholder={t("template_timing_other_placeholder")}
                      value={draft.timingOther}
                      onChange={(event) => patch({ timingOther: event.target.value })}
                      className="mt-2"
                    />
                    {errors.timingOther && (
                      <p className="mt-1 text-xs text-[#C03A3A]">{errors.timingOther}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <SummaryBox name={displayName} action={draft.action} />
              <div>
                <label htmlFor="template-tags" className="text-sm font-medium text-[#456B68]">
                  {t("template_tags_label")}
                </label>
                <Input
                  id="template-tags"
                  placeholder={t("template_tags_placeholder")}
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  onBlur={() => tagInput.trim() && addTag(tagInput)}
                  className="mt-2"
                />
                {draft.tags.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {draft.tags.map((tag) => (
                      <li key={tag}>
                        <button
                          type="button"
                          className="inline-flex h-[29px] items-center rounded-full border border-[#CDEBE8] bg-white px-3 text-xs font-semibold text-[#0D5B59] hover:bg-[#F5FFFD]"
                          onClick={() => patch({ tags: draft.tags.filter((item) => item !== tag) })}
                          aria-label={t("template_tag_remove", { tag })}
                        >
                          {tag} ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <TemplateResourceEditor
                resources={draft.resources}
                onChange={(resources) => patch({ resources })}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">
                {displayName || t("template_untitled")}
              </h3>
              <div className="rounded-xl border border-[#EDF8F6] p-5 shadow-[0_10px_24px_rgba(15,48,54,0.06)]">
                <p className="text-base font-medium">
                  {draft.action.trim() || t("template_no_action")}
                </p>
                {summaryMeta && <p className="mt-2 text-sm text-[#0D7773]">{summaryMeta}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {timingLabel && (
                    <span className="rounded-full border border-[#F0DDB8] bg-[#FFF8EC] px-2.5 py-1 text-xs text-[#A95D00]">
                      {timingLabel}
                    </span>
                  )}
                  {draft.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex h-[29px] items-center rounded-full border border-[#CDEBE8] bg-white px-3 text-xs font-semibold text-[#0D5B59]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {draft.resources.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#0D3036]">
                    {t("template_resources_title")}
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {draft.resources.map((resource) => (
                      <li
                        key={resource.key}
                        className="flex h-12 items-center truncate rounded-lg border border-[#DDEFED] px-3.5"
                      >
                        {resource.url ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            title={resource.url}
                            className="text-[#0D7773] underline-offset-2 hover:underline"
                          >
                            {resource.name}
                          </a>
                        ) : (
                          <span>{resource.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-[#DDEFED] bg-white px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "rounded-full border-[#CDEBE8] text-[#0D7773]",
              !hasAnyContent(draft) && "opacity-55"
            )}
            disabled={busy}
            onClick={() => void submit("draft")}
          >
            {t("template_save_draft")}
          </Button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-[#CDEBE8] font-normal"
                disabled={busy}
                onClick={() => setStep((current) => current - 1)}
              >
                {t("template_prev")}
              </Button>
            )}
            {step < 4 ? (
              <Button type="button" className="rounded-full" disabled={busy} onClick={goNext}>
                {t("template_next")}
              </Button>
            ) : (
              <Button
                type="button"
                className="rounded-full"
                disabled={busy}
                onClick={() => void submit("ready")}
              >
                {template ? t("template_finish_update") : t("template_finish_create")}
              </Button>
            )}
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function SummaryBox({ name, action }: { name: string; action: string }) {
  const t = useTranslations("lighthouse");
  return (
    <div className="rounded-2xl bg-[#F7FCFB] p-4">
      <p className="text-sm font-semibold">{name || t("template_untitled")}</p>
      <p className="mt-1 text-sm text-[#5A7B79]">{action.trim() || t("template_no_action")}</p>
    </div>
  );
}

function QuickOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-[42px] rounded-[10px] border text-sm font-semibold transition-colors",
        active
          ? "border-[#16B9B3] bg-white text-[#0D7773]"
          : "border-[#DDEFED] text-[#456B68] hover:bg-[#F5FFFD]"
      )}
    >
      {children}
    </button>
  );
}
