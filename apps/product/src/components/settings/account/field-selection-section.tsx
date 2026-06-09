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
import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { AccountFormValues } from "./schema";
import { type FieldOption, useFieldSelectionSheet } from "./use-field-selection-sheet";

interface FieldSelectionSectionProps {
  form: UseFormReturn<AccountFormValues>;
  fieldName: "professionalFields" | "explorationFields" | "position";
  label: string;
  /** 可選的領域列表 { value, label } */
  availableFields: readonly FieldOption[];
  maxSelection: number;
}

export const FieldSelectionSection = ({
  form,
  fieldName,
  label,
  availableFields,
  maxSelection,
}: FieldSelectionSectionProps) => {
  const t = useTranslations("app_product");
  const selectedFields = form.watch(fieldName) || [];

  // 根據 value 取得 label 的輔助函數
  const getLabelByValue = useCallback(
    (value: string) => {
      const field = availableFields.find((f) => f.value === value);
      return field?.label ?? value; // 如果找不到就顯示原值（自訂領域）
    },
    [availableFields]
  );

  // 根據欄位類型決定自訂欄位的標籤
  const customFieldLabel =
    fieldName === "position" ? t("field_custom_role") : t("field_custom_field");

  const { openFieldSelectionSheet } = useFieldSelectionSheet({
    initialFields: selectedFields,
    availableFields,
    maxSelection,
    title: label,
    customFieldLabel,
    onComplete: (data) => {
      form.setValue(fieldName, data.selectedFields);
    },
  });

  const handleClear = () => {
    form.setValue(fieldName, []);
  };

  return (
    <div className="bg-white rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="font-medium text-base text-text-dark">{label}</FormLabel>
        {selectedFields.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={handleClear} className="h-9">
            {t("selection_clear")}
          </Button>
        )}
      </div>

      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div>
                {Array.isArray(field.value) && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {field.value.map((value) => (
                      <Badge key={value} variant="outline-blue" className="rounded-lg px-4 py-2">
                        {getLabelByValue(value)}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  onClick={openFieldSelectionSheet}
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
