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
import type { UseFormReturn } from "react-hook-form";
import {
  DURATION_MINUTES_OPTIONS,
  EXECUTION_TIMING_OPTIONS,
  type ManualPracticeFormValues,
} from "../schema";

interface Step3Props {
  form: UseFormReturn<ManualPracticeFormValues>;
}

export const Step3 = ({ form }: Step3Props) => {
  const t = useTranslations("practice");
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="durationMinutes"
        render={({ field }) => (
          <FormItem>
            <FormLabel required className="block text-base font-medium text-text-dark mb-3">
              {t("form_session_duration")}
            </FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Slider
                  defaultValue={[30]}
                  value={[field.value]}
                  onValueChange={(value: number[]) => {
                    field.onChange(value[0]);
                  }}
                  min={15}
                  max={60}
                  step={15}
                  className="w-full"
                  renderTooltip={(value) => <div>{value}{t("minutes_unit")}</div>}
                />
                {/* Labels */}
                <div className="flex justify-between">
                  {DURATION_MINUTES_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        "text-sm transition-colors",
                        field.value === option.value
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
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="executionTiming"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-3">
              <FormLabel className="text-base font-medium text-text-dark">{t("form_execution_timing")}</FormLabel>
              <FormDescription className="text-sm text-light-gray">{t("form_execution_timing_multi")}</FormDescription>
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
