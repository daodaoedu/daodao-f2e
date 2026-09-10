"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Calendar } from "@daodao/ui/components/calendar";
import { Checkbox } from "@daodao/ui/components/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { RadioGroup, RadioGroupItem } from "@daodao/ui/components/radio-group";
import { cn } from "@daodao/ui/lib/utils";
import { addDays, format, startOfDay } from "date-fns";
import { CalendarIcon, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ExecutionTiming } from "@/constants/practice-form";
import { calcEndDate, defaultSegmentCount, normalizeFrequency } from "@/lib/practice-create";
import { getEffectiveSegments, parseIsoDate, resetSegmentDays } from "./derive";
import {
  addCustomTiming,
  createEmptySegments,
  isDayPreset,
  isFrequencyPreset,
  isMinutePreset,
  resizeSegments,
  sanitizeDaysInput,
  sanitizeMinutesInput,
  TIMING_LABEL_KEYS,
} from "./rhythm-utils";
import {
  CUSTOM_TIMING_MAX_LENGTH,
  DURATION_DAY_PRESETS,
  FREQUENCY_PRESETS,
  MINUTE_PRESETS,
  SEGMENTS_MAX,
  SEGMENTS_MIN,
  SPLIT_THRESHOLD_DAYS,
  START_DATE_MAX_OFFSET_DAYS,
  TIMING_PRESETS,
  type WizardFormValues,
  WizardMode,
} from "./schema";
import { SegmentCard } from "./segment-card";
import { SplitPromptCard } from "./split-prompt-card";
import {
  WIZARD_INPUT,
  WIZARD_INPUT_LG,
  WIZARD_LINK_COLOR,
  WIZARD_OPTION_BASE,
  WIZARD_TEXT_LINK,
  wizardOptionState,
} from "./wizard-styles";

export interface StepRhythmProps {
  form: UseFormReturn<WizardFormValues>;
}

const labelClass = "text-base font-medium leading-[1.4] text-text-dark";
const optionBase = WIZARD_OPTION_BASE;
const optionState = wizardOptionState;

/** Step 2｜節奏設定（開始日期、天數、頻率、時間、時機；含拆段） */
export const StepRhythm = ({ form }: StepRhythmProps) => {
  const t = useTranslations("practice");
  const values = form.watch();
  const { mode, startDate, durationDays, frequency, sessionMinutes, isSegmented, segments } =
    values;
  const rejectedDayValue = values.rejectedDayValue;
  const errors = form.formState.errors;

  const today = startOfDay(new Date());
  const maxStartDate = addDays(today, START_DATE_MAX_OFFSET_DAYS);
  const selectedStart = parseIsoDate(startDate);

  // 自訂輸入框文字（回到本步驟時由既有非預設值還原）
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [daysText, setDaysText] = useState(() =>
    durationDays !== null && !isDayPreset(durationDays) ? String(durationDays) : ""
  );
  const [frequencyText, setFrequencyText] = useState(() =>
    frequency && !isFrequencyPreset(frequency) ? frequency : ""
  );
  const [minutesText, setMinutesText] = useState(() =>
    sessionMinutes !== null && !isMinutePreset(sessionMinutes) ? String(sessionMinutes) : ""
  );
  const [timingText, setTimingText] = useState("");

  const endDateText =
    selectedStart && durationDays
      ? format(calcEndDate(selectedStart, durationDays), "yyyy/MM/dd")
      : "";

  /** 天數變更共用入口：寫值、清錯誤、≤ 30 時自動關閉拆段 */
  const applyDurationDays = (next: number | null) => {
    form.setValue("durationDays", next, { shouldDirty: true });
    if (errors.durationDays) form.clearErrors("durationDays");
    if (isSegmented && (next === null || next <= SPLIT_THRESHOLD_DAYS)) {
      form.setValue("isSegmented", false, { shouldDirty: true });
      form.setValue("segments", [], { shouldDirty: true });
    }
  };

  const acceptSplit = () => {
    if (durationDays === null) return;
    form.setValue("isSegmented", true, { shouldDirty: true });
    form.setValue("segments", createEmptySegments(defaultSegmentCount(durationDays)), {
      shouldDirty: true,
    });
    form.setValue("rejectedDayValue", null, { shouldDirty: true });
  };

  const rejectSplit = () => {
    form.setValue("rejectedDayValue", durationDays, { shouldDirty: true });
  };

  const disableSplit = () => {
    form.setValue("isSegmented", false, { shouldDirty: true });
    form.setValue("segments", [], { shouldDirty: true });
    form.clearErrors("segments");
  };

  const changeSegmentCount = (count: number) => {
    if (count < SEGMENTS_MIN || count > SEGMENTS_MAX) return;
    form.setValue("segments", resetSegmentDays(resizeSegments(segments, count)), {
      shouldDirty: true,
    });
  };

  const commitFrequencyText = () => {
    const normalized = normalizeFrequency(frequencyText);
    form.setValue("frequency", normalized, { shouldDirty: true });
    // 正規化後等於預設值 → 交給預設按鈕高亮，清空自訂框
    setFrequencyText(isFrequencyPreset(normalized) ? "" : normalized);
    if (normalized && errors.frequency) form.clearErrors("frequency");
  };

  const showSplitPrompt =
    durationDays !== null &&
    durationDays > SPLIT_THRESHOLD_DAYS &&
    !isSegmented &&
    rejectedDayValue !== durationDays;

  const effectiveSegments = isSegmented
    ? getEffectiveSegments(values, t("wizard_name_fallback"))
    : [];
  const segmentDaysSum = effectiveSegments.reduce((sum, seg) => sum + seg.days, 0);
  const quotaMatches = durationDays !== null && segmentDaysSum === durationDays;
  const segmentsRootError = errors.segments?.message ?? errors.segments?.root?.message;
  const canDecrease = segments.length > SEGMENTS_MIN;
  const canIncrease = segments.length < SEGMENTS_MAX;

  return (
    <div className="space-y-4">
      {mode === WizardMode.personal && (
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel required className={cn(labelClass, "mb-3 block")}>
                {t("wizard_start_date_label")}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    ref={field.ref}
                    name={field.name}
                    readOnly
                    value={selectedStart ? format(selectedStart, "yyyy/MM/dd") : ""}
                    placeholder={t("wizard_start_date_placeholder")}
                    invalid={!!errors.startDate}
                    aria-expanded={calendarOpen}
                    className={cn(
                      "h-10 cursor-pointer py-2 pr-10 pl-4 focus-visible:py-2 focus-visible:pr-10 focus-visible:pl-4",
                      WIZARD_INPUT
                    )}
                    onClick={() => setCalendarOpen((open) => !open)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setCalendarOpen((open) => !open);
                      }
                    }}
                    onBlur={field.onBlur}
                  />
                  <CalendarIcon
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 right-4 size-3.5 -translate-y-1/2 text-text-dark"
                  />
                </div>
              </FormControl>
              {calendarOpen && (
                <div className="mt-2.5 rounded-[10px] border border-bg-gray bg-white shadow-[0_8px_24px_rgba(15,48,54,0.10)]">
                  <Calendar
                    mode="single"
                    weekStartsOn={0}
                    selected={selectedStart ?? undefined}
                    defaultMonth={selectedStart ?? today}
                    disabled={[{ before: today }, { after: maxStartDate }]}
                    classNames={{ day_button: "rounded-full" }}
                    onSelect={(date) => {
                      if (!date) return;
                      field.onChange(format(date, "yyyy-MM-dd"));
                      form.clearErrors("startDate");
                      setCalendarOpen(false);
                    }}
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="durationDays"
        render={() => (
          <FormItem>
            <FormLabel required className={cn(labelClass, "mb-2 block")}>
              {t("wizard_days_label")}
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={daysText === "" && isDayPreset(durationDays) ? String(durationDays) : ""}
                onValueChange={(value) => {
                  setDaysText("");
                  applyDurationDays(Number.parseInt(value, 10));
                }}
                className="grid grid-cols-4 gap-2"
              >
                {DURATION_DAY_PRESETS.map((preset) => {
                  const isSelected = daysText === "" && durationDays === preset;
                  const inputId = `wizard-days-${preset}`;
                  const label = `${preset}${t("wizard_days_unit")}`;
                  return (
                    <label
                      key={preset}
                      htmlFor={inputId}
                      className={cn(optionBase, optionState(isSelected), "px-2 text-[15px]")}
                    >
                      <RadioGroupItem
                        value={String(preset)}
                        id={inputId}
                        className="sr-only"
                        aria-label={label}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <Input
              inputMode="numeric"
              value={daysText}
              placeholder={t("wizard_days_custom_placeholder")}
              aria-label={t("wizard_days_custom_placeholder")}
              invalid={!!errors.durationDays}
              className={cn("mt-2", WIZARD_INPUT_LG)}
              onChange={(event) => {
                const next = sanitizeDaysInput(event.target.value);
                setDaysText(next.text);
                applyDurationDays(next.value);
              }}
            />
            {endDateText && (
              <p className="mt-2 text-sm text-text-dark">
                {t("wizard_end_date", { date: endDateText })}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {showSplitPrompt && durationDays !== null && (
        <SplitPromptCard days={durationDays} onAccept={acceptSplit} onReject={rejectSplit} />
      )}

      {!isSegmented && (
        <>
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className={cn(labelClass, "mb-2 block")}>
                  {t("wizard_frequency_label")}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={
                      frequencyText === "" && isFrequencyPreset(field.value) ? field.value : ""
                    }
                    onValueChange={(value) => {
                      setFrequencyText("");
                      field.onChange(value);
                      form.clearErrors("frequency");
                    }}
                    onBlur={field.onBlur}
                    className="grid grid-cols-3 gap-2"
                  >
                    {FREQUENCY_PRESETS.map((preset) => {
                      const isSelected = frequencyText === "" && field.value === preset;
                      const inputId = `wizard-frequency-${preset}`;
                      const label = `${preset} ${t("wizard_frequency_unit")}`;
                      return (
                        <label
                          key={preset}
                          htmlFor={inputId}
                          className={cn(
                            optionBase,
                            optionState(isSelected),
                            "gap-1 px-2 text-[15px] font-normal"
                          )}
                        >
                          <RadioGroupItem
                            value={preset}
                            id={inputId}
                            className="sr-only"
                            aria-label={label}
                          />
                          <span className="font-medium">{preset}</span>
                          <span>{t("wizard_frequency_unit")}</span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <Input
                  value={frequencyText}
                  maxLength={7}
                  placeholder={t("wizard_frequency_custom_placeholder")}
                  aria-label={t("wizard_frequency_custom_placeholder")}
                  invalid={!!errors.frequency}
                  className={cn("mt-2", WIZARD_INPUT_LG)}
                  onChange={(event) => setFrequencyText(event.target.value)}
                  onBlur={commitFrequencyText}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitFrequencyText();
                    }
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sessionMinutes"
            render={({ field }) => (
              <FormItem>
                <div className="mb-3 flex items-center gap-2">
                  <FormLabel className={labelClass}>{t("wizard_minutes_label")}</FormLabel>
                  <span className="text-sm text-light-gray">{t("wizard_optional")}</span>
                </div>
                <FormControl>
                  <div className="grid grid-cols-4 gap-2">
                    {MINUTE_PRESETS.map((preset) => {
                      const isSelected = minutesText === "" && field.value === preset;
                      return (
                        <Button
                          key={preset}
                          type="button"
                          variant="white"
                          aria-pressed={isSelected}
                          className={cn(
                            optionBase,
                            optionState(isSelected),
                            "h-auto w-full text-sm shadow-none hover:shadow-none"
                          )}
                          onClick={() => {
                            setMinutesText("");
                            field.onChange(field.value === preset ? null : preset);
                          }}
                        >
                          {`${preset}${t("wizard_minutes_unit")}`}
                        </Button>
                      );
                    })}
                  </div>
                </FormControl>
                <Input
                  inputMode="numeric"
                  maxLength={3}
                  value={minutesText}
                  placeholder={t("wizard_minutes_custom_placeholder")}
                  aria-label={t("wizard_minutes_custom_placeholder")}
                  className={cn("mt-2", WIZARD_INPUT_LG)}
                  onChange={(event) => {
                    const next = sanitizeMinutesInput(event.target.value);
                    setMinutesText(next.text);
                    field.onChange(next.value);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timings"
            render={({ field }) => (
              <FormItem>
                <div className="mb-3 flex items-center gap-2">
                  <FormLabel className={labelClass}>{t("wizard_timing_label")}</FormLabel>
                  <span className="text-sm text-light-gray">{t("wizard_optional")}</span>
                </div>
                <FormControl>
                  <div className="grid grid-cols-3 gap-2">
                    {TIMING_PRESETS.map((preset) => {
                      const current: ExecutionTiming[] = field.value ?? [];
                      const isSelected = current.includes(preset);
                      const inputId = `wizard-timing-${preset}`;
                      const label = t(TIMING_LABEL_KEYS[preset]);
                      return (
                        <label
                          key={preset}
                          htmlFor={inputId}
                          className={cn(optionBase, optionState(isSelected), "text-sm")}
                        >
                          <Checkbox
                            id={inputId}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              field.onChange(
                                checked
                                  ? [...current, preset]
                                  : current.filter((value) => value !== preset)
                              );
                            }}
                            onBlur={field.onBlur}
                            className="sr-only"
                            aria-label={label}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customTimings"
            render={({ field }) => {
              const list: string[] = field.value ?? [];
              return (
                <FormItem className="!mt-2">
                  <FormControl>
                    <Input
                      value={timingText}
                      maxLength={CUSTOM_TIMING_MAX_LENGTH}
                      placeholder={t("wizard_timing_custom_placeholder")}
                      aria-label={t("wizard_timing_custom_placeholder")}
                      className={WIZARD_INPUT_LG}
                      onChange={(event) => setTimingText(event.target.value)}
                      onBlur={field.onBlur}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        field.onChange(addCustomTiming(list, timingText));
                        setTimingText("");
                      }}
                    />
                  </FormControl>
                  {list.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {list.map((name) => (
                        <span
                          key={name}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border border-logo-cyan bg-light-blue py-[3px] pr-1 pl-3 text-sm leading-normal",
                            WIZARD_LINK_COLOR
                          )}
                        >
                          <span>{name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t("wizard_timing_remove", { name })}
                            className={cn(
                              "size-7 rounded-full hover:bg-white/60",
                              WIZARD_LINK_COLOR
                            )}
                            onClick={() => field.onChange(list.filter((item) => item !== name))}
                          >
                            <X className="size-4" />
                          </Button>
                        </span>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </>
      )}

      {isSegmented && (
        <div>
          {/* 段數調整器（POC：膠囊 stepper ＋ 右側配額說明） */}
          <div className="flex items-center gap-4">
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-bg-gray bg-white p-1">
              <span className="sr-only">{t("wizard_split_count_label")}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("wizard_split_decrease")}
                disabled={!canDecrease}
                className={cn(
                  "size-9 rounded-full hover:bg-light-blue disabled:opacity-100",
                  canDecrease ? "text-text-dark" : "text-bg-gray"
                )}
                onClick={() => changeSegmentCount(segments.length - 1)}
              >
                <Minus className="size-4.5" />
              </Button>
              <span className="min-w-[52px] text-center text-base font-medium text-text-dark">
                {segments.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("wizard_split_increase")}
                disabled={!canIncrease}
                className={cn(
                  "size-9 rounded-full hover:bg-light-blue disabled:opacity-100",
                  canIncrease ? "text-text-dark" : "text-bg-gray"
                )}
                onClick={() => changeSegmentCount(segments.length + 1)}
              >
                <Plus className="size-4.5" />
              </Button>
            </div>
            {durationDays !== null && (
              <p
                className={cn(
                  "min-w-0 flex-1 text-[13px] leading-normal",
                  quotaMatches ? "text-light-gray" : "text-red"
                )}
                role={quotaMatches ? undefined : "alert"}
              >
                {quotaMatches
                  ? t("wizard_split_quota_ok", { total: durationDays })
                  : t("wizard_split_quota_mismatch", {
                      total: durationDays,
                      current: segmentDaysSum,
                    })}
              </p>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            {effectiveSegments.map((effective) => (
              <SegmentCard
                key={effective.index}
                form={form}
                index={effective.index}
                effective={effective}
              />
            ))}
          </div>

          {segmentsRootError && !quotaMatches && (
            <p className="mt-2.5 text-sm text-red" role="alert">
              {String(segmentsRootError)}
            </p>
          )}

          <button
            type="button"
            className={cn(WIZARD_TEXT_LINK, "mt-1 cursor-pointer text-light-gray")}
            onClick={disableSplit}
          >
            {t("wizard_split_no")}
          </button>
        </div>
      )}
    </div>
  );
};
