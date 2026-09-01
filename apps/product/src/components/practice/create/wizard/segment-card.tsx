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
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { formatDateRange, normalizeFrequency } from "@/lib/practice-create";
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

export interface SegmentCardProps {
  form: UseFormReturn<WizardFormValues>;
  index: number;
  effective: EffectiveSegment;
}

const labelClass = "block text-sm font-medium text-text-dark mb-2";

/** 下拉顯示值：「其他…」展開中 → sentinel；否則為預設值或空（顯示 placeholder） */
const resolveSelectValue = (isOther: boolean, presetValue: string): string =>
  isOther ? SELECT_OTHER_VALUE : presetValue;

/** 拆段時的逐段欄位卡片：名稱 / 行動 / 天數 / 頻率 / 時間 / 時機 */
export const SegmentCard = ({ form, index, effective }: SegmentCardProps) => {
  const t = useTranslations("practice");
  const globalFrequency = form.watch("frequency");
  const globalMinutes = form.watch("sessionMinutes");

  const frequencyOverride = form.watch(`segments.${index}.frequency`) ?? "";
  const minutesOverride = form.watch(`segments.${index}.minutes`) ?? null;
  const timingOverride = form.watch(`segments.${index}.timing`) ?? "";

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

  const frequencySelectValue = resolveSelectValue(
    frequencyOther,
    isFrequencyPreset(frequencyOverride) ? frequencyOverride : ""
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

  return (
    <div className="rounded-lg border border-bg-gray bg-white p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-logo-cyan text-sm font-medium text-white">
          <span aria-hidden>{index + 1}</span>
          <span className="sr-only">{t("wizard_segment_badge", { index: index + 1 })}</span>
        </span>
        {effective.start && effective.end && (
          <span className="text-sm text-text-dark">
            {formatDateRange(effective.start, effective.end)}
          </span>
        )}
      </div>

      <FormField
        control={form.control}
        name={`segments.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className={labelClass}>{t("wizard_segment_name")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                maxLength={NAME_MAX_LENGTH}
                placeholder={effective.name}
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
          <FormItem>
            <FormLabel className={labelClass}>{t("wizard_segment_action")}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ""}
                rows={2}
                className="min-h-16 resize-y"
                maxLength={ACTION_MAX_LENGTH}
                placeholder={effective.action}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`segments.${index}.days`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{t("wizard_segment_days")}</FormLabel>
              <FormControl>
                <Input
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  inputMode="numeric"
                  value={field.value === null ? String(effective.days) : String(field.value)}
                  onChange={(event) => field.onChange(sanitizeDaysInput(event.target.value).value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`segments.${index}.frequency`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{t("wizard_segment_frequency")}</FormLabel>
              <div className="space-y-2">
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
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`segments.${index}.minutes`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{t("wizard_segment_minutes")}</FormLabel>
              <div className="space-y-2">
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
                    <SelectTrigger onBlur={field.onBlur}>
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
                    onChange={(event) => {
                      const next = sanitizeMinutesInput(event.target.value);
                      setMinutesText(next.text);
                      field.onChange(next.value);
                    }}
                  />
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`segments.${index}.timing`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{t("wizard_segment_timing")}</FormLabel>
              <div className="space-y-2">
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
                    <SelectTrigger onBlur={field.onBlur}>
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
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                  />
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
