"use client";

import { useTranslations } from "@daodao/i18n";
import { DatePicker } from "@daodao/ui/components/date-picker";
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
import { addDays, format, isValid } from "date-fns";
import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { sanitizeDaysInput } from "@/components/practice/create/wizard/rhythm-utils";
import { normalizeFrequency } from "@/lib/practice-create";
import { parseLocalDate, practiceEndDateString } from "@/utils/practice-period";
import { DURATION_DAYS_OPTIONS, FREQUENCY_OPTIONS, type ManualPracticeFormValues } from "../schema";

interface Step2Props {
  form: UseFormReturn<ManualPracticeFormValues>;
  // 開始日與天數是否停用
  disabled?: boolean;
  // 頻率是否停用；預設跟 disabled 相同。共同挑戰只鎖期間、不鎖頻率（daodao#385）
  frequencyDisabled?: boolean;
  minStartDate?: Date;
}

const DAY_PRESETS: readonly string[] = DURATION_DAYS_OPTIONS.map((option) => option.value);
const FREQUENCY_PRESETS: readonly string[] = FREQUENCY_OPTIONS.map((option) => option.value);

/**
 * 自訂輸入框顯示的文字：使用者正在輸入時用輸入中的文字，
 * 否則由表單值推回（不是預設選項的值就是自訂值，例 45 天、每週 1-3 天；daodao#370）
 */
const customText = (typing: string | null, value: string, presets: readonly string[]) =>
  typing ?? (presets.includes(value) ? "" : value);

export const Step2 = ({
  form,
  disabled = false,
  frequencyDisabled = disabled,
  minStartDate,
}: Step2Props) => {
  const t = useTranslations("practice");
  const startDate = form.watch("startDate");
  const durationDays = form.watch("durationDays");
  const [daysTyping, setDaysTyping] = useState<string | null>(null);
  const [frequencyTyping, setFrequencyTyping] = useState<string | null>(null);

  const endDate = useMemo(() => {
    if (!durationDays) return "";
    const end = practiceEndDateString(startDate, Number.parseInt(durationDays, 10));
    return end ? end.replace(/-/g, "/") : "";
  }, [startDate, durationDays]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => {
          // 以當地日曆日解析，new Date('YYYY-MM-DD') 在負時差時區會變成前一天（daodao#277）
          const date = (field.value && parseLocalDate(field.value)) || undefined;

          return (
            <FormItem>
              <FormLabel required className="block text-base font-medium text-text-dark mb-3">
                {t("form_start_date")}
              </FormLabel>
              <FormControl>
                <DatePicker
                  ref={field.ref}
                  value={date}
                  invalid={!!form.formState.errors.startDate}
                  placeholder={t("form_start_date_placeholder")}
                  disabled={disabled}
                  onBlur={field.onBlur}
                  minDate={minStartDate ?? new Date()}
                  maxDate={addDays(new Date(), 14)}
                  onError={(errorMessage) => {
                    form.setError("startDate", { message: errorMessage });
                  }}
                  onChange={(calendarDate) => {
                    if (disabled) return;
                    if (calendarDate && isValid(calendarDate)) {
                      field.onChange(format(calendarDate, "yyyy-MM-dd"));
                    } else {
                      field.onChange("");
                    }
                    form.clearErrors("startDate");
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="durationDays"
        render={({ field }) => {
          const daysText = customText(daysTyping, field.value ?? "", DAY_PRESETS);
          const selectedPreset = daysText === "" ? (field.value ?? "") : "";
          return (
            <FormItem>
              <FormLabel required className="block text-base font-medium text-text-dark mb-3">
                {t("form_duration")}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={selectedPreset}
                  onValueChange={(value) => {
                    if (!disabled) {
                      setDaysTyping(null);
                      field.onChange(value);
                    }
                  }}
                  onBlur={field.onBlur}
                  disabled={disabled}
                  className="grid grid-cols-4 gap-3"
                >
                  {DURATION_DAYS_OPTIONS.map((option) => {
                    const isSelected = selectedPreset === option.value;
                    const inputId = `duration-${option.value}`;
                    const label = t(`${option.labelKey}`);
                    return (
                      <label
                        key={option.value}
                        htmlFor={inputId}
                        className={cn(
                          "flex items-center justify-center p-4.5 rounded-lg border transition-colors bg-white text-text-dark",
                          disabled
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:border-bg-gray",
                          isSelected ? "border-logo-cyan text-logo-cyan" : "border-transparent"
                        )}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={inputId}
                          className="sr-only"
                          aria-label={label}
                          disabled={disabled}
                        />
                        <span className="text-base font-medium">{label}</span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <Input
                inputMode="numeric"
                value={daysText}
                disabled={disabled}
                placeholder={t("wizard_days_custom_placeholder")}
                aria-label={t("wizard_days_custom_placeholder")}
                invalid={!!form.formState.errors.durationDays}
                className="mt-3 w-full"
                onChange={(event) => {
                  if (disabled) return;
                  const next = sanitizeDaysInput(event.target.value);
                  setDaysTyping(next.text);
                  field.onChange(next.text);
                }}
                onBlur={() => {
                  setDaysTyping(null);
                  field.onBlur();
                }}
              />
              {startDate && durationDays && endDate && (
                <p className="text-sm text-text-dark mt-2">
                  {t("form_end_date", { date: endDate })}
                </p>
              )}
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="frequency"
        render={({ field }) => {
          const frequencyText = customText(frequencyTyping, field.value ?? "", FREQUENCY_PRESETS);
          const selectedPreset = frequencyText === "" ? (field.value ?? "") : "";
          return (
            <FormItem>
              <FormLabel required className="block text-base font-medium text-text-dark mb-3">
                {t("form_frequency")}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={selectedPreset}
                  onValueChange={(value) => {
                    if (!frequencyDisabled) {
                      setFrequencyTyping(null);
                      field.onChange(value);
                    }
                  }}
                  onBlur={field.onBlur}
                  disabled={frequencyDisabled}
                  className="grid grid-cols-3 gap-3"
                >
                  {FREQUENCY_OPTIONS.map((option) => {
                    const isSelected = selectedPreset === option.value;
                    const inputId = `frequency-${option.value}`;
                    const unit = t(`${option.unitKey}`);
                    const description = t(`${option.descriptionKey}`);
                    return (
                      <label
                        key={option.value}
                        htmlFor={inputId}
                        className={cn(
                          "flex flex-col gap-1 items-center justify-center p-2 rounded-lg border transition-colors bg-white text-text-dark",
                          frequencyDisabled
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:border-bg-gray",
                          isSelected ? "border-logo-cyan text-logo-cyan" : "border-transparent"
                        )}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={inputId}
                          className="sr-only"
                          aria-label={`${option.label} ${description}`}
                          disabled={frequencyDisabled}
                        />
                        <span
                          className={cn(
                            "flex gap-1",
                            isSelected ? "text-logo-cyan" : "text-text-dark"
                          )}
                        >
                          <span className="font-medium">{option.label}</span>
                          {unit}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            isSelected ? "text-logo-cyan" : "text-text-dark"
                          )}
                        >
                          {description}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <Input
                value={frequencyText}
                maxLength={7}
                disabled={frequencyDisabled}
                placeholder={t("wizard_frequency_custom_placeholder")}
                aria-label={t("wizard_frequency_custom_placeholder")}
                invalid={!!form.formState.errors.frequency}
                className="mt-3 w-full"
                onChange={(event) => {
                  if (frequencyDisabled) return;
                  // 輸入中保留原文字（例「1~3」），表單值存正規化結果「1-3」
                  setFrequencyTyping(event.target.value);
                  field.onChange(normalizeFrequency(event.target.value));
                }}
                onBlur={() => {
                  setFrequencyTyping(null);
                  field.onBlur();
                }}
              />
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};
