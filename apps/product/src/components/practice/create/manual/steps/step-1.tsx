"use client";

import { useTranslations } from "@daodao/i18n";
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
  /** 鎖定名稱（共同挑戰實踐的名稱由挑戰統一設定，FR-CC-10） */
  nameDisabled?: boolean;
}

export const Step1 = ({ form, nameDisabled = false }: Step1Props) => {
  const t = useTranslations("practice");
  const descriptionLength = form.watch("actionDescription")?.length || 0;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel required className="block text-base font-medium text-text-dark mb-3">
              {t("manual_step_name_label")}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("manual_step_name_placeholder")}
                className="w-full"
                maxLength={20}
                disabled={nameDisabled}
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
                {t("manual_step_action_label")}
              </FormLabel>
              <FormDescription className="text-sm text-light-gray">
                {descriptionLength}/50
              </FormDescription>
            </div>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t("manual_step_action_placeholder")}
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
