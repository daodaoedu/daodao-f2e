"use client";

import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";

export interface PickerCheckIn {
  id: string;
  day: number;
  date: string;
  note: string;
}

interface CheckinPickerSheetProps {
  checkIns: PickerCheckIn[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
}

const MAX_SELECTION = 3;

/** 依筆記字數挑選字數最多的 N 則作為預設精選 */
function getDefaultSelection(checkIns: PickerCheckIn[]): string[] {
  return [...checkIns]
    .sort((a, b) => b.note.length - a.note.length)
    .slice(0, MAX_SELECTION)
    .map((checkIn) => checkIn.id);
}

/**
 * 打卡精選底部抽屜選擇器
 * @description 列出全部打卡，最多可選 3 則作為分享卡精選；提供「恢復預設」重置為字數最多的 3 則
 */
export function CheckinPickerSheet({
  checkIns,
  selectedIds,
  onConfirm,
  onClose,
}: CheckinPickerSheetProps) {
  const [selected, setSelected] = useState<string[]>(selectedIds);

  const sorted = [...checkIns].sort((a, b) => b.day - a.day);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= MAX_SELECTION) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleRestoreDefault = () => {
    setSelected(getDefaultSelection(checkIns));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between pb-3 text-sm text-logo-gray">
        <span>最多選 3 則 · {selected.length}/3 已選</span>
        <button
          type="button"
          onClick={handleRestoreDefault}
          className="flex items-center gap-1 text-xs text-logo-cyan"
        >
          <RotateCcw className="size-3" />
          恢復預設
        </button>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto pb-3">
        {sorted.map((checkIn) => {
          const isSelected = selected.includes(checkIn.id);
          return (
            <button
              key={checkIn.id}
              type="button"
              onClick={() => toggle(checkIn.id)}
              className={cn(
                "relative w-full rounded-2xl border p-4 text-left transition-colors",
                isSelected ? "border-logo-cyan" : "border-basic-200"
              )}
            >
              <span
                className={cn(
                  "absolute right-3.5 top-3.5 flex size-6 items-center justify-center rounded-full border-2",
                  isSelected ? "border-logo-cyan bg-logo-cyan" : "border-basic-200 bg-transparent"
                )}
              >
                {isSelected && <Check className="size-3.5 text-white" />}
              </span>
              <span className="flex items-center gap-2 pr-8 text-sm">
                <span className="font-semibold text-text-dark">Day {checkIn.day}</span>
                <span className="text-xs text-logo-gray">{checkIn.date}</span>
                <span className="ml-auto text-[11px] text-basic-300">{checkIn.note.length} 字</span>
              </span>
              <p className="mt-1.5 line-clamp-2 pr-8 text-[13px] leading-relaxed text-logo-gray">
                {checkIn.note}
              </p>
            </button>
          );
        })}

        {sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-logo-gray">目前還沒有打卡紀錄</p>
        )}
      </div>

      <div className="flex gap-2.5 border-t border-basic-100 pt-3.5">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          取消
        </Button>
        <Button type="button" className="flex-[2]" onClick={() => onConfirm(selected)}>
          確認
        </Button>
      </div>
    </div>
  );
}
