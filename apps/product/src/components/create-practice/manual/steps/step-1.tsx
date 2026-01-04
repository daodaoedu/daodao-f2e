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
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { ManualPracticeFormValues, DURATION_MINUTES_OPTIONS } from "../schema";
import { Textarea } from "@daodao/ui/components/textarea";
import { Slider } from "@daodao/ui/components/slider";

interface Step1Props {
  form: UseFormReturn<ManualPracticeFormValues>;
}

export const Step1 = ({ form }: Step1Props) => {
  const actionDescription = form.watch("actionDescription");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel
              required
              className="block text-base font-medium text-text-dark mb-3"
            >
              名稱
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="例如：閱讀《原子習慣》"
                className="w-full"
                maxLength={20}
                invalid={!!form.formState.errors.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="actionDescription"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-3">
              <FormLabel
                required
                className="text-base font-medium text-text-dark"
              >
                實踐行動
              </FormLabel>
              <FormDescription className="text-sm text-light-gray">
                {actionDescription?.length || 0}/50
              </FormDescription>
            </div>
            <FormControl>
              <Textarea
                {...field}
                placeholder="例如：圖書館借閱，每天閱讀 30 頁"
                className="w-full"
                maxLength={50}
                invalid={!!form.formState.errors.actionDescription}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="durationMinutes"
        render={({ field }) => (
          <FormItem>
            <FormLabel
              required
              className="block text-base font-medium text-text-dark mb-3"
            >
              實踐執行目標
            </FormLabel>
            <FormDescription className="text-sm text-text-dark mt-2 mb-4">
              一次實踐時間
            </FormDescription>
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
                  step={1}
                  className="w-full"
                  renderTooltip={(value) => <div>{value}分鐘</div>}
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
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
