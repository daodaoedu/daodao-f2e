"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { isValid, format, addDays, parse } from "date-fns";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { DatePicker } from "@daodao/ui/components/date-picker";
import { RadioGroup, RadioGroupItem } from "@daodao/ui/components/radio-group";
import { cn } from "@daodao/ui/lib/utils";
import { ManualPracticeFormValues, DURATION_DAYS_OPTIONS, FREQUENCY_OPTIONS } from "../schema";

interface Step2Props {
  form: UseFormReturn<ManualPracticeFormValues>;
}

export const Step2 = ({ form }: Step2Props) => {
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
              <FormLabel
                required
                className="block text-base font-medium text-text-dark mb-3"
              >
                開始時間
              </FormLabel>
              <FormControl>
                <DatePicker
                  ref={field.ref}
                  value={date}
                  invalid={!!form.formState.errors.startDate}
                  placeholder="選擇日期"
                  onBlur={field.onBlur}
                  onChange={(calendarDate) => {
                    if (calendarDate && isValid(calendarDate)) {
                      field.onChange(format(calendarDate, "yyyy-MM-dd"));
                    } else {
                      field.onChange("");
                    }
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
            <FormLabel
              required
              className="block text-base font-medium text-text-dark mb-3"
            >
              想要持續多久
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                className="grid grid-cols-4 gap-3"
              >
                {DURATION_DAYS_OPTIONS.map((option) => {
                  const isSelected = field.value === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex items-center justify-center p-4.5 rounded-lg border transition-colors cursor-pointer bg-white text-text-dark",
                        isSelected
                          ? "border-logo-cyan text-logo-cyan"
                          : "border-transparent hover:border-bg-gray"
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`duration-${option.value}`}
                        className="sr-only"
                        aria-label={option.label}
                      />
                      <span className="text-base font-medium">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            {startDate && durationDays && endDate && (
              <p className="text-sm text-light-gray mt-2">結束於 {endDate}</p>
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
            <FormLabel
              required
              className="block text-base font-medium text-text-dark mb-3"
            >
              頻率
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                className="grid grid-cols-3 gap-3"
              >
                {FREQUENCY_OPTIONS.map((option) => {
                  const isSelected = field.value === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex flex-col gap-1 items-center justify-center p-2 rounded-lg border transition-colors cursor-pointer bg-white text-text-dark",
                        isSelected
                          ? "border-logo-cyan text-logo-cyan"
                          : "border-transparent hover:border-bg-gray"
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`frequency-${option.value}`}
                        className="sr-only"
                        aria-label={`${option.label} ${option.description}`}
                      />
                      <span
                        className={cn(
                          "flex gap-1",
                          isSelected ? "text-logo-cyan" : "text-text-dark"
                        )}
                      >
                        <span className="font-medium">{option.label}</span>
                        {option.unit}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          isSelected ? "text-logo-cyan" : "text-text-dark"
                        )}
                      >
                        {option.description}
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
