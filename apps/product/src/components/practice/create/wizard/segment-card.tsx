"use client";

import { useTranslations } from "@daodao/i18n";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { normalizeFrequency } from "@/lib/practice-create";
import { type EffectiveSegment, isTimingPreset } from "./derive";
import {
  isFrequencyPreset,
  isMinutePreset,
  SELECT_OTHER_VALUE,
  sanitizeDaysInput,
  sanitizeFrequencyInput,
  sanitizeMinutesInput,
  TIMING_LABEL_KEYS,
} from "./rhythm-utils";
import {
  ACTION_MAX_LENGTH,
  FREQUENCY_PRESETS,
  MINUTE_PRESETS,
  NAME_MAX_LENGTH,
  SEGMENT_TIMING_MAX_LENGTH,
  TIMING_PRESETS,
  type WizardFormValues,
} from "./schema";
import {
  WIZARD_INPUT,
  WIZARD_INPUT_SM,
  WIZARD_LINK_COLOR,
  WIZARD_SELECT_SM,
} from "./wizard-styles";

export interface SegmentCardProps {
  form: UseFormReturn<WizardFormValues>;
  index: number;
  effective: EffectiveSegment;
}

const labelClass = "mb-1 block text-xs font-normal leading-[1.4] text-text-dark";
const customInputClass = cn(
  "mt-1.5 h-[34px] px-2.5 py-1.5 text-[13px] focus-visible:px-2.5 focus-visible:py-1.5",
  WIZARD_INPUT
);

/** 下拉顯示值：「其他…」展開中 → sentinel；否則為預設值或空（顯示 placeholder） */
const resolveSelectValue = (isOther: boolean, presetValue: string): string =>
  isOther ? SELECT_OTHER_VALUE : presetValue;

/** 拆段時的逐段欄位卡片：名稱 / 行動 / 天數 / 頻率 / 時間 / 時機。POC：欄位預填繼承值，清空後由預覽回退 */
export const SegmentCard = ({ form, index, effective }: SegmentCardProps) => {
  const t = useTranslations("practice");
  const globalFrequency = form.watch("frequency");
  const globalMinutes = form.watch("sessionMinutes");

  const frequencyOverride = form.watch(`segments.${index}.frequency`) ?? "";
  const minutesOverride = form.watch(`segments.${index}.minutes`) ?? null;
  const timingOverride = form.watch(`segments.${index}.timing`) ?? "";

  // 名稱／行動：未曾編輯前顯示繼承值（POC 預填），開始輸入後顯示原始值，清空即留空
  const [nameTouched, setNameTouched] = useState(false);
  const [actionTouched, setActionTouched] = useState(false);

  // 「其他…」展開狀態：以既有覆寫是否為非預設值初始化，選單切回預設時關閉
  const [frequencyOther, setFrequencyOther] = useState(
    frequencyOverride !== "" && !isFrequencyPreset(frequencyOverride)
  );
  const [frequencyText, setFrequencyText] = useState(frequencyOther ? frequencyOverride : "");
  const [minutesOther, setMinutesOther] = useState(
    minutesOverride !== null && !isMinutePreset(minutesOverride)
  );
  const [minutesText, setMinutesText] = useState(
    minutesOther && minutesOverride !== null ? String(minutesOverride) : ""
  );
  const [timingOther, setTimingOther] = useState(
    timingOverride !== "" && !isTimingPreset(timingOverride)
  );

  // POC：未覆寫時下拉直接顯示繼承的全域頻率（非 placeholder）
  const inheritedFrequency = isFrequencyPreset(globalFrequency) ? globalFrequency : "";
  const frequencySelectValue = resolveSelectValue(
    frequencyOther,
    isFrequencyPreset(frequencyOverride) ? frequencyOverride : inheritedFrequency
  );
  const minutesSelectValue = resolveSelectValue(
    minutesOther,
    isMinutePreset(minutesOverride) ? String(minutesOverride) : ""
  );
  const timingSelectValue = resolveSelectValue(
    timingOther,
    isTimingPreset(timingOverride) ? timingOverride : ""
  );

  const frequencyPlaceholder = globalFrequency
    ? `${globalFrequency} ${t("wizard_frequency_unit")}`
    : t("wizard_select_frequency");
  const minutesPlaceholder =
    globalMinutes !== null
      ? `${globalMinutes} ${t("wizard_minutes_unit")}`
      : t("wizard_select_minutes");

  const commitFrequencyText = (onChange: (value: string) => void) => {
    const normalized = normalizeFrequency(frequencyText);
    onChange(normalized);
    setFrequencyText(normalized);
    if (form.formState.errors.segments?.[index]?.frequency) {
      form.clearErrors(`segments.${index}.frequency`);
    }
  };

  const rangeText =
    effective.start && effective.end
      ? `${formatFull(effective.start)} – ${formatFull(effective.end)}`
      : "";

  return (
    <div className="rounded-[12px] border border-bg-gray bg-white p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-light-blue text-xs",
            WIZARD_LINK_COLOR
          )}
        >
          <span aria-hidden>{index + 1}</span>
          <span className="sr-only">{t("wizard_segment_badge", { index: index + 1 })}</span>
        </span>
        {rangeText && <span className="text-[13px] text-light-gray">{rangeText}</span>}
      </div>

      <div className="flex flex-col gap-2.5">
        <FormField
          control={form.control}
          name={`segments.${index}.name`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel className={labelClass}>{t("wizard_segment_name")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={nameTouched ? (field.value ?? "") : field.value || effective.name}
                  maxLength={NAME_MAX_LENGTH}
                  className={WIZARD_INPUT_SM}
                  onChange={(event) => {
                    setNameTouched(true);
                    field.onChange(event.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`segments.${index}.action`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel className={labelClass}>{t("wizard_segment_action")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={actionTouched ? (field.value ?? "") : field.value || effective.action}
                  rows={2}
                  className={cn(
                    "min-h-[60px] resize-none px-2.5 py-2 text-sm leading-normal focus-visible:px-2.5 focus-visible:py-2",
                    WIZARD_INPUT
                  )}
                  maxLength={ACTION_MAX_LENGTH}
                  onChange={(event) => {
                    setActionTouched(true);
                    field.onChange(event.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`segments.${index}.days`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel className={labelClass}>{t("wizard_segment_days")}</FormLabel>
              <FormControl>
                <Input
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  inputMode="numeric"
                  className={WIZARD_INPUT_SM}
                  value={field.value === null ? String(effective.days) : String(field.value)}
                  onChange={(event) => field.onChange(sanitizeDaysInput(event.target.value).value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 每週頻率 ＋ 每次執行時間並排（POC） */}
        <div className="flex gap-2.5">
          <FormField
            control={form.control}
            name={`segments.${index}.frequency`}
            render={({ field }) => (
              <FormItem className="min-w-0 flex-1 space-y-0">
                <FormLabel className={labelClass}>{t("wizard_segment_frequency")}</FormLabel>
                <Select
                  value={frequencySelectValue}
                  onValueChange={(value) => {
                    if (value === SELECT_OTHER_VALUE) {
                      setFrequencyOther(true);
                      setFrequencyText(isFrequencyPreset(field.value) ? "" : (field.value ?? ""));
                      return;
                    }
                    setFrequencyOther(false);
                    setFrequencyText("");
                    field.onChange(value);
                    form.clearErrors(`segments.${index}.frequency`);
                  }}
                >
                  <FormControl>
                    <SelectTrigger
                      invalid={!!form.formState.errors.segments?.[index]?.frequency}
                      onBlur={field.onBlur}
                      className={WIZARD_SELECT_SM}
                    >
                      <SelectValue placeholder={frequencyPlaceholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FREQUENCY_PRESETS.map((preset) => (
                      <SelectItem key={preset} value={preset}>
                        {preset} {t("wizard_frequency_unit")}
                      </SelectItem>
                    ))}
                    <SelectItem value={SELECT_OTHER_VALUE}>{t("wizard_select_other")}</SelectItem>
                  </SelectContent>
                </Select>
                {frequencyOther && (
                  <Input
                    inputMode="numeric"
                    maxLength={7}
                    value={frequencyText}
                    placeholder={t("wizard_segment_frequency_placeholder")}
                    aria-label={t("wizard_segment_frequency")}
                    invalid={!!form.formState.errors.segments?.[index]?.frequency}
                    className={customInputClass}
                    onChange={(event) =>
                      setFrequencyText(sanitizeFrequencyInput(event.target.value))
                    }
                    onBlur={() => commitFrequencyText(field.onChange)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitFrequencyText(field.onChange);
                      }
                    }}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`segments.${index}.minutes`}
            render={({ field }) => (
              <FormItem className="min-w-0 flex-1 space-y-0">
                <FormLabel className={labelClass}>{t("wizard_segment_minutes")}</FormLabel>
                <Select
                  value={minutesSelectValue}
                  onValueChange={(value) => {
                    if (value === SELECT_OTHER_VALUE) {
                      setMinutesOther(true);
                      setMinutesText(
                        field.value !== null && !isMinutePreset(field.value)
                          ? String(field.value)
                          : ""
                      );
                      return;
                    }
                    setMinutesOther(false);
                    setMinutesText("");
                    field.onChange(Number.parseInt(value, 10));
                  }}
                >
                  <FormControl>
                    <SelectTrigger onBlur={field.onBlur} className={WIZARD_SELECT_SM}>
                      <SelectValue placeholder={minutesPlaceholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MINUTE_PRESETS.map((preset) => (
                      <SelectItem key={preset} value={String(preset)}>
                        {preset} {t("wizard_minutes_unit")}
                      </SelectItem>
                    ))}
                    <SelectItem value={SELECT_OTHER_VALUE}>{t("wizard_select_other")}</SelectItem>
                  </SelectContent>
                </Select>
                {minutesOther && (
                  <Input
                    inputMode="numeric"
                    maxLength={3}
                    value={minutesText}
                    placeholder={t("wizard_segment_minutes_placeholder")}
                    aria-label={t("wizard_segment_minutes")}
                    className={customInputClass}
                    onChange={(event) => {
                      const next = sanitizeMinutesInput(event.target.value);
                      setMinutesText(next.text);
                      field.onChange(next.value);
                    }}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`segments.${index}.timing`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel className={labelClass}>{t("wizard_segment_timing")}</FormLabel>
              <Select
                value={timingSelectValue}
                onValueChange={(value) => {
                  if (value === SELECT_OTHER_VALUE) {
                    setTimingOther(true);
                    if (isTimingPreset(field.value ?? "")) field.onChange("");
                    return;
                  }
                  setTimingOther(false);
                  field.onChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger onBlur={field.onBlur} className={WIZARD_SELECT_SM}>
                    <SelectValue placeholder={t("wizard_select_timing")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIMING_PRESETS.map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {t(TIMING_LABEL_KEYS[preset])}
                    </SelectItem>
                  ))}
                  <SelectItem value={SELECT_OTHER_VALUE}>{t("wizard_select_other")}</SelectItem>
                </SelectContent>
              </Select>
              {timingOther && (
                <Input
                  value={field.value ?? ""}
                  maxLength={SEGMENT_TIMING_MAX_LENGTH}
                  placeholder={t("wizard_segment_timing_placeholder")}
                  aria-label={t("wizard_segment_timing")}
                  className={customInputClass}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

const pad = (n: number) => String(n).padStart(2, "0");
/** POC 段落區間格式：YYYY/MM/DD – YYYY/MM/DD（前後皆完整年份） */
const formatFull = (d: Date) => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
