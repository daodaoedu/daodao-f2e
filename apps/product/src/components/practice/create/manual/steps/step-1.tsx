"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { Textarea } from "@daodao/ui/components/textarea";
import type { UseFormReturn } from "react-hook-form";
import type { ManualPracticeFormValues } from "../schema";

interface Step1Props {
  form: UseFormReturn<ManualPracticeFormValues>;
}

export const Step1 = ({ form }: Step1Props) => {
  const descriptionLength = form.watch("actionDescription")?.length || 0;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel required className="block text-base font-medium text-text-dark mb-3">
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
              <FormLabel required className="text-base font-medium text-text-dark">
                實踐行動
              </FormLabel>
              <FormDescription className="text-sm text-light-gray">
                {descriptionLength}/50
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
    </div>
  );
};
