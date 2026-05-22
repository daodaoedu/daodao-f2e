"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Check, Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { PreferenceSelectionData } from "./use-preference-selection-sheet";

interface PreferenceSelectionSheetContentProps {
  initialOptionIds: number[];
  availableOptions: Array<{
    id: number;
    name: string;
    value: string;
    description?: string | null;
  }>;
  maxSelection: number | null;
  onComplete: (data: PreferenceSelectionData) => void;
  onClose?: () => void;
}

export const PreferenceSelectionSheetContent = ({
  initialOptionIds = [],
  availableOptions,
  maxSelection,
  onComplete,
  onClose,
}: PreferenceSelectionSheetContentProps) => {
  const t = useTranslations("app_product");
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>(initialOptionIds);

  // 過濾出未選中的可用選項
  const unselectedOptions = useMemo(() => {
    return availableOptions.filter((option) => !selectedOptionIds.includes(option.id));
  }, [availableOptions, selectedOptionIds]);

  // 獲取已選中的選項
  const selectedOptions = useMemo(() => {
    return availableOptions.filter((option) => selectedOptionIds.includes(option.id));
  }, [availableOptions, selectedOptionIds]);

  const handleAddOption = useCallback(
    (optionId: number) => {
      if (selectedOptionIds.includes(optionId)) {
        return;
      }
      if (maxSelection !== null && selectedOptionIds.length >= maxSelection) {
        return;
      }
      setSelectedOptionIds((prev) => [...prev, optionId]);
    },
    [maxSelection, selectedOptionIds]
  );

  const handleRemoveOption = useCallback((optionId: number) => {
    setSelectedOptionIds((prev) => prev.filter((id) => id !== optionId));
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedOptionIds.length === 0) {
      return;
    }
    onComplete({ selectedOptionIds });
    onClose?.();
  }, [selectedOptionIds, onComplete, onClose]);

  const canAddMore = maxSelection === null || selectedOptionIds.length < maxSelection;
  const hasSelection = selectedOptionIds.length > 0;
  const selectionCount =
    maxSelection !== null
      ? `${selectedOptionIds.length}/${maxSelection}`
      : `${selectedOptionIds.length}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-16 space-y-8">
        {/* 可選擇區塊 */}
        {unselectedOptions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm text-text-dark">{t("selection_available")}</h3>
            <div className="flex flex-col gap-2.5">
              {unselectedOptions.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="ghost"
                  onClick={() => handleAddOption(option.id)}
                  disabled={!canAddMore}
                  className="w-full justify-between rounded-lg bg-very-light-blue border border-blue px-4 py-2 hover:bg-very-light-blue/80"
                  aria-label={t("selection_add_item", { item: option.name })}
                >
                  <span className="text-sm text-left flex-1 whitespace-normal wrap-break-word">
                    {option.name}
                  </span>
                  <Plus className="size-4.5 shrink-0 ml-2" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 已選擇區塊 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-text-dark">{t("selection_selected")}</h3>
            {maxSelection !== null && (
              <span className="text-sm text-text-dark">{selectionCount}</span>
            )}
          </div>
          {selectedOptions.length > 0 ? (
            <div className="flex flex-col gap-2.5 p-3 bg-light-blue border border-blue rounded-lg">
              {selectedOptions.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveOption(option.id)}
                  className="w-full justify-between px-4 py-2 rounded-lg bg-white border border-blue transition-colors"
                  aria-label={t("selection_remove_item", { item: option.name })}
                >
                  <span className="text-left flex-1 whitespace-normal wrap-break-word">
                    {option.name}
                  </span>
                  <X className="size-4.5 shrink-0 ml-2" />
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 p-3 bg-light-blue border border-blue rounded-lg">
              <p className="text-sm text-text-dark text-center py-4">{t("selection_empty")}</p>
            </div>
          )}
          {!hasSelection && <p className="text-sm text-red">{t("selection_required")}</p>}
        </div>
      </div>

      {/* 完成按鈕 */}
      <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6">
        <Button
          type="button"
          variant="orange"
          className="w-full"
          onClick={handleSubmit}
          disabled={!hasSelection}
        >
          <Check className="size-4.5" />
          {t("done")}
        </Button>
      </div>
    </div>
  );
};
