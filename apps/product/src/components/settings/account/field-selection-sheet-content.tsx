"use client";

import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { Check, Plus, X, ChevronRight } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import type { FieldSelectionData } from "./use-field-selection-sheet";

interface FieldSelectionSheetContentProps {
  initialFields: string[];
  availableFields: string[];
  maxSelection: number;
  onComplete: (data: FieldSelectionData) => void;
  onClose?: () => void;
}

export const FieldSelectionSheetContent = ({
  initialFields = [],
  availableFields,
  maxSelection,
  onComplete,
  onClose,
}: FieldSelectionSheetContentProps) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(initialFields);
  const [customFieldInput, setCustomFieldInput] = useState("");

  // 過濾出未選中的可用領域
  const unselectedFields = useMemo(() => {
    return availableFields.filter((field) => !selectedFields.includes(field));
  }, [availableFields, selectedFields]);

  const handleAddField = useCallback(
    (field: string) => {
      if (selectedFields.includes(field)) {
        return;
      }
      if (selectedFields.length >= maxSelection) {
        return;
      }
      setSelectedFields((prev) => [...prev, field]);
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
            <h3 className="text-sm text-text-dark">可選擇</h3>
            <div className="flex flex-wrap gap-3">
              {unselectedFields.map((field) => (
                <Button
                  key={field}
                  type="button"
                  variant="ghost"
                  onClick={() => handleAddField(field)}
                  disabled={!canAddMore}
                  className="rounded-lg bg-very-light-blue border border-blue px-4 py-2"
                  aria-label={`新增 ${field}`}
                >
                  <span className="text-sm">{field}</span>
                  <Plus className="size-4.5 shrink-0" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 其他領域區塊 */}
        <div className="space-y-3">
          <h3 className="text-sm text-text-dark">其他領域</h3>
          <div className="flex gap-2">
            <Input
              value={customFieldInput}
              onChange={(e) => setCustomFieldInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="專業領域名稱"
              disabled={!canAddMore}
              className="flex-1"
              aria-label="輸入自訂專業領域"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCustomField}
              disabled={!canAddMore || !customFieldInput.trim()}
              className="shrink-0 border-logo-cyan bg-white"
              aria-label="新增自訂領域"
            >
              新增
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* 已選擇區塊 */}
        {selectedFields.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm text-text-dark">已選擇</h3>
            <div className="flex flex-col gap-2.5 p-3 bg-light-blue border border-blue rounded-lg">
              {selectedFields.map((field) => (
                <Button
                  key={field}
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveField(field)}
                  className="px-4 py-2 rounded-lg bg-white border border-blue transition-colors"
                  aria-label={`移除 ${field}`}
                >
                  <span className="text-left flex-1">{field}</span>
                  <X className="size-4.5 shrink-0" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 完成按鈕 */}
      <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6">
        <Button
          type="button"
          variant="orange"
          className="w-full"
          onClick={handleSubmit}
        >
          <Check className="size-4.5" />
          完成
        </Button>
      </div>
    </div>
  );
};
