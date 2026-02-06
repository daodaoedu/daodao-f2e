"use client";

import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { cn } from "@daodao/ui/lib/utils";
import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { AVAILABLE_FIELDS, INTEREST_CATEGORIES, type OnboardingFormValues } from "./schema";

interface InterestsSectionProps {
  form: UseFormReturn<OnboardingFormValues>;
}

/**
 * Onboarding Step 2: 興趣領域區塊
 * 包含專業領域和興趣領域選擇
 */
export const InterestsSection = ({ form }: InterestsSectionProps) => {
  const t = useTranslations("onboarding");

  const selectedProfessional = form.watch("professionalFields") || [];
  const selectedInterests = form.watch("interests") || [];

  const handleToggle = useCallback(
    (fieldName: "professionalFields" | "interests", value: string, maxSelection: number) => {
      const current = form.getValues(fieldName) || [];
      const isSelected = current.includes(value);

      if (isSelected) {
        form.setValue(
          fieldName,
          current.filter((v) => v !== value),
          { shouldValidate: true, shouldDirty: true }
        );
      } else if (current.length < maxSelection) {
        form.setValue(fieldName, [...current, value], { shouldValidate: true, shouldDirty: true });
      }
    },
    [form]
  );

  return (
    <div className="space-y-8">
      {/* 標題 */}
      <div className="text-center mb-8">
        <h1 className="heading-lg text-text-dark mb-2">{t("steps.interests.title")}</h1>
      </div>

      {/* 專業領域 */}
      <FormField
        control={form.control}
        name="professionalFields"
        render={() => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-4">
              {t("steps.interests.professionalFieldsLabel")}
              <span className="text-light-gray text-sm font-normal ml-2">
                ({selectedProfessional.length}/5)
              </span>
            </FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_FIELDS.map((field) => {
                  const isSelected = selectedProfessional.includes(field.value);
                  const isDisabled = !isSelected && selectedProfessional.length >= 5;

                  return (
                    <Badge
                      key={field.value}
                      variant={isSelected ? "outline-blue" : "outline-ghost"}
                      className={cn(
                        "cursor-pointer transition-all px-4 py-2 rounded-lg",
                        isSelected && "border-logo-cyan bg-light-blue",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (!isDisabled) {
                          handleToggle("professionalFields", field.value, 5);
                        }
                      }}
                    >
                      {field.label}
                    </Badge>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 興趣領域 */}
      <FormField
        control={form.control}
        name="interests"
        render={() => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-4">
              {t("steps.interests.interestsLabel")}
              <span className="text-red ml-1">*</span>
              <span className="text-light-gray text-sm font-normal ml-2">
                ({selectedInterests.length}/5)
              </span>
            </FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {INTEREST_CATEGORIES.map((category) => {
                  const isSelected = selectedInterests.includes(category.value);
                  const isDisabled = !isSelected && selectedInterests.length >= 5;

                  return (
                    <Badge
                      key={category.value}
                      variant={isSelected ? "outline-blue" : "outline-ghost"}
                      className={cn(
                        "cursor-pointer transition-all px-4 py-2 rounded-lg",
                        isSelected && "border-logo-cyan bg-light-blue",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (!isDisabled) {
                          handleToggle("interests", category.value, 5);
                        }
                      }}
                    >
                      {category.label}
                    </Badge>
                  );
                })}
              </div>
            </FormControl>
            {selectedInterests.length >= 5 && (
              <p className="text-xs text-logo-cyan mt-2">{t("steps.interests.maxReached")}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
