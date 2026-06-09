"use client";

import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import type { UseFormReturn } from "react-hook-form";
import type { PreferencesFormValues } from "./schema";
import { usePreferenceSelectionSheet } from "./use-preference-selection-sheet";

interface PreferenceSectionProps {
  form: UseFormReturn<PreferencesFormValues>;
  preferenceTypeId: string;
  preferenceTypeName: string;
  preferenceTypeDescription?: string | null;
  availableOptions: Array<{
    id: number;
    name: string;
    value: string;
    description?: string | null;
  }>;
  maxSelection: number | null;
}

export const PreferenceSection = ({
  form,
  preferenceTypeId,
  preferenceTypeName,
  preferenceTypeDescription,
  availableOptions,
  maxSelection,
}: PreferenceSectionProps) => {
  const t = useTranslations("app_product");
  const selectedOptionIds = form.watch(`preferences.${preferenceTypeId}`) || [];

  // 獲取已選選項的名稱
  const selectedOptionNames = selectedOptionIds
    .map((optionId) => {
      const option = availableOptions.find((opt) => opt.id === optionId);
      return option?.name;
    })
    .filter((name): name is string => Boolean(name));

  const { openPreferenceSelectionSheet } = usePreferenceSelectionSheet({
    initialOptionIds: selectedOptionIds,
    availableOptions,
    maxSelection,
    title: preferenceTypeName,
    onComplete: (data) => {
      form.setValue(`preferences.${preferenceTypeId}`, data.selectedOptionIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
  });

  const handleClear = () => {
    form.setValue(`preferences.${preferenceTypeId}`, [], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="bg-white rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <FormLabel className="font-medium text-base text-text-dark">
            {preferenceTypeName}
            <span className="text-red ml-1">*</span>
          </FormLabel>
          {preferenceTypeDescription && (
            <p className="text-sm text-text-dark mt-1">{preferenceTypeDescription}</p>
          )}
        </div>
        {selectedOptionIds.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={handleClear} className="h-9">
            {t("selection_clear")}
          </Button>
        )}
      </div>

      <FormField
        control={form.control}
        name={`preferences.${preferenceTypeId}`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div>
                {Array.isArray(field.value) && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedOptionNames.map((name, index) => (
                      <Badge
                        key={selectedOptionIds[index]}
                        variant="outline-blue"
                        className="rounded-lg px-4 py-2"
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  onClick={openPreferenceSelectionSheet}
                  className="w-full bg-logo-cyan text-white hover:bg-logo-cyan/90"
                >
                  {t("edit")}
                  <ArrowRightOutlineSvg className="size-4.5" />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
