"use client";

import { ArrowRightOutlineSvg } from "@daodao/assets";
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
import type { AccountFormValues } from "./schema";
import { useFieldSelectionSheet } from "./use-field-selection-sheet";

interface FieldSelectionSectionProps {
  form: UseFormReturn<AccountFormValues>;
  fieldName: "professionalFields" | "explorationFields";
  label: string;
  availableFields: string[];
  maxSelection: number;
}

export const FieldSelectionSection = ({
  form,
  fieldName,
  label,
  availableFields,
  maxSelection,
}: FieldSelectionSectionProps) => {
  const selectedFields = form.watch(fieldName) || [];

  const { openFieldSelectionSheet } = useFieldSelectionSheet({
    initialFields: selectedFields,
    availableFields,
    maxSelection,
    title: label,
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
            清空選項
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
                    {field.value.map((field) => (
                      <Badge key={field} variant="outline-blue" className="rounded-lg px-4 py-2">
                        {field}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  onClick={openFieldSelectionSheet}
                  className="w-full bg-logo-cyan text-white hover:bg-logo-cyan/90"
                >
                  編輯
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
