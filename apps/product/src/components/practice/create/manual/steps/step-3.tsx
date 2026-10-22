"use client";

import { useTranslations } from "@daodao/i18n";
import { Checkbox } from "@daodao/ui/components/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { Slider } from "@daodao/ui/components/slider";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { sanitizeMinutesInput } from "@/components/practice/create/wizard/rhythm-utils";
import {
  DURATION_MINUTES_OPTIONS,
  EXECUTION_TIMING_OPTIONS,
  type ManualPracticeFormValues,
} from "../schema";

interface Step3Props {
  form: UseFormReturn<ManualPracticeFormValues>;
}

const MINUTE_PRESETS: readonly number[] = DURATION_MINUTES_OPTIONS.map((option) => option.value);

const customMinutesText = (typing: string | null, value: number | null) =>
  typing ?? (value == null || MINUTE_PRESETS.includes(value) ? "" : String(value));

export const Step3 = ({ form }: Step3Props) => {
  const t = useTranslations("practice");
  const [minutesTyping, setMinutesTyping] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="durationMinutes"
        render={({ field }) => {
          // 不是 15／30／45／60 的分鐘數（例 25）顯示在自訂框，沒設定時不預設 30（daodao#370）
          const minutesText = customMinutesText(minutesTyping, field.value);
          return (
            <FormItem>
              <FormLabel required className="block text-base font-medium text-text-dark mb-3">
                {t("form_session_duration")}
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Slider
                    value={field.value != null ? [field.value] : []}
                    onValueChange={(value: number[]) => {
                      setMinutesTyping(null);
                      field.onChange(value[0]);
                    }}
                    min={15}
                    max={60}
                    step={15}
                    className="w-full"
                    renderTooltip={(value) => (
                      <div>
                        {value}
                        {t("minutes_unit")}
                      </div>
                    )}
                  />
                  {/* Labels */}
                  <div className="flex justify-between">
                    {DURATION_MINUTES_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setMinutesTyping(null);
                          field.onChange(option.value);
                        }}
                        className={cn(
                          "text-sm transition-colors",
                          minutesText === "" && field.value === option.value
                            ? "text-logo-cyan font-medium"
                            : "text-light-gray hover:text-text-dark"
                        )}
                      >
                        {t(`${option.labelKey}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </FormControl>
              <Input
                inputMode="numeric"
                maxLength={3}
                value={minutesText}
                placeholder={t("wizard_minutes_custom_placeholder")}
                aria-label={t("wizard_minutes_custom_placeholder")}
                className="w-full"
                onChange={(event) => {
                  const next = sanitizeMinutesInput(event.target.value);
                  setMinutesTyping(next.text);
                  // 清空自訂框 = 沒選；存檔時 null 不送，保留原本的分鐘數
                  field.onChange(next.value);
                }}
                onBlur={() => {
                  setMinutesTyping(null);
                  field.onBlur();
                }}
              />
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="executionTiming"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-3">
              <FormLabel className="text-base font-medium text-text-dark">
                {t("form_execution_timing")}
              </FormLabel>
              <FormDescription className="text-sm text-light-gray">
                {t("form_execution_timing_multi")}
              </FormDescription>
            </div>
            <FormControl>
              <div className="grid grid-cols-3 gap-3">
                {EXECUTION_TIMING_OPTIONS.map((option) => {
                  const isSelected = field.value?.includes(option.value);
                  const inputId = `execution-timing-${option.value}`;
                  const label = t(`${option.labelKey}`);
                  return (
                    <label
                      key={option.value}
                      htmlFor={inputId}
                      className={cn(
                        "flex items-center justify-center p-4.5 rounded-lg border transition-colors cursor-pointer bg-white text-text-dark",
                        isSelected
                          ? "border-logo-cyan text-logo-cyan"
                          : "border-transparent hover:border-bg-gray"
                      )}
                    >
                      <Checkbox
                        id={inputId}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          const newValue = checked
                            ? [...currentValue, option.value]
                            : currentValue.filter((v) => v !== option.value);
                          field.onChange(newValue);
                        }}
                        onBlur={field.onBlur}
                        className="sr-only"
                        aria-label={label}
                      />
                      <span className="text-sm sm:text-base font-medium whitespace-nowrap">
                        {label}
                      </span>
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
        name="customTiming"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block text-sm font-normal text-text-dark mb-3">
              {t("form_custom_timing")}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("form_custom_timing_placeholder")}
                className="w-full"
                maxLength={20}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
