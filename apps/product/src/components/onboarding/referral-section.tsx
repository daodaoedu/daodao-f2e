"use client";

import { useTranslations } from "@daodao/i18n";
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
import type { UseFormReturn } from "react-hook-form";
import { type OnboardingFormValues, REFERRAL_SOURCE_OPTIONS } from "./schema";

interface ReferralSectionProps {
  form: UseFormReturn<OnboardingFormValues>;
}

/**
 * Onboarding Step 3: 來源調查區塊
 * 讓用戶選擇如何得知島島阿學
 */
export const ReferralSection = ({ form }: ReferralSectionProps) => {
  const t = useTranslations("onboarding");

  const selectedSource = form.watch("referralSource");
  const isOthersSelected = selectedSource === "others";

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="text-center mb-8">
        <h1 className="heading-lg text-text-dark mb-2">{t("steps.referral.title")}</h1>
        <p className="text-light-gray">{t("steps.referral.subtitle")}</p>
      </div>

      {/* 來源選項 */}
      <FormField
        control={form.control}
        name="referralSource"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-3">
                {REFERRAL_SOURCE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`referral-${option.value}`}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      "hover:border-logo-cyan",
                      field.value === option.value
                        ? "border-logo-cyan bg-light-blue"
                        : "border-basic-200 bg-white"
                    )}
                  >
                    <RadioGroupItem id={`referral-${option.value}`} value={option.value} />
                    <span className="text-text-dark">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 「其他」的詳細說明輸入框 */}
      {isOthersSelected && (
        <FormField
          control={form.control}
          name="otherReferralText"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block font-medium text-text-dark mb-3">
                {t("steps.referral.otherLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("steps.referral.otherPlaceholder")}
                  className={cn(
                    form.formState.errors.otherReferralText && "border-red focus-visible:border-red"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
