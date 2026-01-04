"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { cn } from "@daodao/ui/lib/utils";
import { ManualPracticeFormValues, EXECUTION_TIMING_OPTIONS } from "../schema";
import { Input } from "@daodao/ui/components/input";

interface Step3Props {
  form: UseFormReturn<ManualPracticeFormValues>;
}

export const Step3 = ({ form }: Step3Props) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="executionTiming"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-3">
              <FormLabel
                required
                className="text-base font-medium text-text-dark"
              >
                執行時機
              </FormLabel>
              <FormDescription className="text-sm text-light-gray">多選</FormDescription>
            </div>
            <FormControl>
              <div className="grid grid-cols-3 gap-3">
                {EXECUTION_TIMING_OPTIONS.map((option) => {
                  const isSelected = field.value?.includes(option.value);
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
                      <Checkbox
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
                        aria-label={option.label}
                      />
                      <span className="text-base font-medium">
                        {option.label}
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
              其他時機
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="你特別想在什麼時候執行呢？"
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
