"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { PublicInfoFormValues } from "./schema";

interface IIntroductionSectionProps {
  form: UseFormReturn<PublicInfoFormValues>;
}

export const IntroductionSection = ({ form }: IIntroductionSectionProps) => {
  const personalSlogan = form.watch("personalSlogan");
  const selfIntroduction = form.watch("selfIntroduction");

  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      {/* 個人標語 */}
      <FormField
        control={form.control}
        name="personalSlogan"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-3">
              <FormLabel className="block font-medium text-text-dark">
                個人標語<span className="text-red ml-1">*</span>
              </FormLabel>
              <FormDescription className="text-sm text-light-gray m-0">
                {personalSlogan?.length || 0}/150
              </FormDescription>
            </div>
            <FormControl>
              <Textarea
                {...field}
                placeholder="輸入能代表你的一句話"
                className={cn(
                  "min-h-[80px] resize-none",
                  form.formState.errors.personalSlogan && "border-red focus-visible:border-red"
                )}
                maxLength={150}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 關於我 */}
      <FormField
        control={form.control}
        name="selfIntroduction"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-3">
              <FormLabel className="block font-medium text-text-dark">關於我</FormLabel>
              <FormDescription className="text-sm text-light-gray m-0">
                {selfIntroduction?.length || 0}/350
              </FormDescription>
            </div>
            <FormControl>
              <Textarea
                {...field}
                placeholder="輸入你的一段詳細描述"
                className={cn(
                  "min-h-[120px] resize-none",
                  form.formState.errors.selfIntroduction && "border-red focus-visible:border-red"
                )}
                maxLength={350}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
