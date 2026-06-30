"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { Check, ChevronRight, Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { FieldOption, FieldSelectionData } from "./use-field-selection-sheet";

interface FieldSelectionSheetContentProps {
  /** 初始選中的領域值（英文 value） */
  initialFields: string[];
  /** 可選的領域列表 { value, label } */
  availableFields: readonly FieldOption[];
  maxSelection: number;
  /** 自訂欄位的標籤文字，例如「其他角色」或「其他領域」 */
  customFieldLabel?: string;
  onComplete: (data: FieldSelectionData) => void;
  onClose?: () => void;
}

export const FieldSelectionSheetContent = ({
  initialFields = [],
  availableFields,
  maxSelection,
  customFieldLabel,
  onComplete,
  onClose,
}: FieldSelectionSheetContentProps) => {
  const t = useTranslations("app_product");
  const resolvedCustomFieldLabel = customFieldLabel ?? t("selection_custom_default");
  // selectedFields 存儲的是 value（英文）
  const [selectedFields, setSelectedFields] = useState<string[]>(initialFields);
  const [customFieldInput, setCustomFieldInput] = useState("");

  // 根據 value 取得 label 的輔助函數
  const getLabelByValue = useCallback(
    (value: string) => {
      const field = availableFields.find((f) => f.value === value);
      return field?.label ?? value; // 如果找不到就顯示原值（自訂領域）
    },
    [availableFields]
  );

  // 過濾出未選中的可用領域
  const unselectedFields = useMemo(() => {
    return availableFields.filter((field) => !selectedFields.includes(field.value));
  }, [availableFields, selectedFields]);

  const handleAddField = useCallback(
    (value: string) => {
      if (selectedFields.includes(value)) {
        return;
      }
      if (selectedFields.length >= maxSelection) {
        return;
      }
      setSelectedFields((prev) => [...prev, value]);
    },
    [maxSelection, selectedFields]
  );

  const handleRemoveField = useCallback((field: string) => {
    setSelectedFields((prev) => prev.filter((f) => f !== field));
  }, []);

  const handleAddCustomField = useCallback(() => {
    const trimmedInput = customFieldInput.trim();
    if (!trimmedInput) {
      return;
    }
    if (selectedFields.includes(trimmedInput)) {
      setCustomFieldInput("");
      return;
    }
    if (selectedFields.length >= maxSelection) {
      return;
    }
    setSelectedFields((prev) => [...prev, trimmedInput]);
    setCustomFieldInput("");
  }, [customFieldInput, maxSelection, selectedFields]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddCustomField();
      }
    },
    [handleAddCustomField]
  );

  const handleSubmit = useCallback(() => {
    onComplete({ selectedFields });
    onClose?.();
  }, [selectedFields, onComplete, onClose]);

  const canAddMore = selectedFields.length < maxSelection;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-16 space-y-8">
        {/* 可選擇區塊 */}
        {unselectedFields.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm text-text-dark">{t("selection_available")}</h3>
            <div className="flex flex-wrap gap-3">
              {unselectedFields.map((field) => (
                <Button
                  key={field.value}
                  type="button"
                  variant="ghost"
                  onClick={() => handleAddField(field.value)}
                  disabled={!canAddMore}
                  className="rounded-lg bg-very-light-blue border border-blue px-4 py-3"
                  aria-label={t("selection_add_item", { item: field.label })}
                >
                  <span className="text-sm">{field.label}</span>
                  <Plus className="size-4.5 shrink-0" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 其他領域區塊 */}
        <div className="space-y-3">
          <h3 className="text-sm text-text-dark">{resolvedCustomFieldLabel}</h3>
          <div className="flex gap-2">
            <Input
              value={customFieldInput}
              onChange={(e) => setCustomFieldInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("selection_name_placeholder")}
              disabled={!canAddMore}
              className="flex-1"
              aria-label={t("selection_input_custom", { label: resolvedCustomFieldLabel })}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCustomField}
              disabled={!canAddMore || !customFieldInput.trim()}
              className="shrink-0 border-logo-cyan bg-white"
              aria-label={t("selection_add_custom")}
            >
              {t("add")}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* 已選擇區塊 */}
        {selectedFields.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm text-text-dark">{t("selection_selected")}</h3>
            <div className="flex flex-col gap-2.5 p-3 bg-light-blue border border-blue rounded-lg">
              {selectedFields.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveField(value)}
                  className="px-4 py-3 rounded-lg bg-white border border-blue transition-colors"
                  aria-label={t("selection_remove_item", { item: getLabelByValue(value) })}
                >
                  <span className="text-left flex-1">{getLabelByValue(value)}</span>
                  <X className="size-4.5 shrink-0" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 完成按鈕 */}
      <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6">
        <Button type="button" variant="orange" className="w-full" onClick={handleSubmit}>
          <Check className="size-4.5" />
          {t("done")}
        </Button>
      </div>
    </div>
  );
};
