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
import { RadioGroup, RadioGroupItem } from "@daodao/ui/components/radio-group";
import { cn } from "@daodao/ui/lib/utils";
import { addDays, format, isValid, parse } from "date-fns";
import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { DURATION_DAYS_OPTIONS, FREQUENCY_OPTIONS, type ManualPracticeFormValues } from "../schema";

interface Step2Props {
  form: UseFormReturn<ManualPracticeFormValues>;
  disabled?: boolean;
  minStartDate?: Date;
}

export const Step2 = ({ form, disabled = false, minStartDate }: Step2Props) => {
  const t = useTranslations("practice");
  const startDate = form.watch("startDate");
  const durationDays = form.watch("durationDays");

  const endDate = useMemo(() => {
    if (!startDate || !durationDays) return "";
    const start = parse(startDate, "yyyy-MM-dd", new Date());
    if (!isValid(start)) return "";
    const days = Number.parseInt(durationDays, 10);
    const end = addDays(start, days);
    return format(end, "yyyy/MM/dd");
  }, [startDate, durationDays]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => {
          const date = field.value ? new Date(field.value) : undefined;

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
        render={({ field }) => (
          <FormItem>
            <FormLabel required className="block text-base font-medium text-text-dark mb-3">
              {t("form_duration")}
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={(value) => {
                  if (!disabled) {
                    field.onChange(value);
                  }
                }}
                onBlur={field.onBlur}
                disabled={disabled}
                className="grid grid-cols-4 gap-3"
              >
                {DURATION_DAYS_OPTIONS.map((option) => {
                  const isSelected = field.value === option.value;
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
            {startDate && durationDays && endDate && (
              <p className="text-sm text-text-dark mt-2">{t("form_end_date", { date: endDate })}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel required className="block text-base font-medium text-text-dark mb-3">
              {t("form_frequency")}
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={(value) => {
                  if (!disabled) {
                    field.onChange(value);
                  }
                }}
                onBlur={field.onBlur}
                disabled={disabled}
                className="grid grid-cols-3 gap-3"
              >
                {FREQUENCY_OPTIONS.map((option) => {
                  const isSelected = field.value === option.value;
                  const inputId = `frequency-${option.value}`;
                  const unit = t(`${option.unitKey}`);
                  const description = t(`${option.descriptionKey}`);
                  return (
                    <label
                      key={option.value}
                      htmlFor={inputId}
                      className={cn(
                        "flex flex-col gap-1 items-center justify-center p-2 rounded-lg border transition-colors bg-white text-text-dark",
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
                        aria-label={`${option.label} ${description}`}
                        disabled={disabled}
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
                        className={cn("text-xs", isSelected ? "text-logo-cyan" : "text-text-dark")}
                      >
                        {description}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
