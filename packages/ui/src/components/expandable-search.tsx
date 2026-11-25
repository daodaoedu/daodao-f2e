"use client";

import { Search, X } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Input } from "./input";

export interface ExpandableSearchDropdownState {
  /** 輸入框目前是否有焦點 */
  focused: boolean;
  /** 收起下拉（例如選了建議字之後） */
  close: () => void;
}

interface ExpandableSearchProps {
  value: string;
  onChange: (value: string) => void;
  /** 按 Enter 或清除時呼叫；不傳就只靠 onChange 即時篩選 */
  onSubmit?: (value: string) => void;
  placeholder: string;
  clearLabel: string;
  /** 聚焦時顯示在輸入框下方的內容（例如搜尋建議） */
  renderDropdown?: (state: ExpandableSearchDropdownState) => ReactNode;
  className?: string;
}

/**
 * 搜尋列（首頁、探索頁共用）：
 * - md 以上一律顯示輸入框（NN/g 不建議桌機只放放大鏡：不顯眼、要多點一次，daodao#567）
 * - 手機收合成放大鏡圓鈕，點了展開並佔滿所在列的剩餘寬度；有輸入值時保持展開
 *
 * 輸入框固定在同一個 DOM 位置，桌機聚焦時不會因重新掛載而失去焦點。
 */
export function ExpandableSearch({
  value,
  onChange,
  onSubmit,
  placeholder,
  clearLabel,
  renderDropdown,
  className,
}: ExpandableSearchProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 手機版是否展開；md 以上由 CSS 一律展開
  const expanded = focused || !!value;

  const expand = () => {
    setFocused(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleClear = () => {
    onChange("");
    onSubmit?.("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    e.preventDefault();
    onSubmit?.(value);
    inputRef.current?.blur();
  };

  return (
    // 展開時在「搜尋 + 篩選」列中佔滿剩餘寬度；手機展開時獨佔一列，篩選換到下一列，
    // 避免篩選條件多時輸入框被擠到 0（daodao#567）
    <div
      className={cn(
        "relative",
        expanded ? "min-w-0 flex-1 basis-full md:min-w-48 md:basis-0" : "md:min-w-48 md:flex-1",
        className
      )}
    >
      {!expanded && (
        <button
          type="button"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#e4eae9] bg-white md:hidden"
          onClick={expand}
          aria-label={placeholder}
        >
          <Search className="size-4 text-text-dark/60" />
        </button>
      )}

      <div
        className={cn(
          "h-10 w-full items-center overflow-hidden rounded-full border border-[#9fb5b8] bg-white px-4",
          expanded ? "flex" : "hidden md:flex"
        )}
      >
        <Search className="mr-2 size-4 shrink-0 text-text-dark/40" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-auto flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-text-dark outline-none placeholder:text-text-dark/40 hover:border-0 focus-visible:border-0 focus-visible:px-0 focus-visible:py-0 focus-visible:ring-0"
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 text-text-dark/40 transition-colors hover:text-text-dark/70"
            aria-label={clearLabel}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {focused && renderDropdown?.({ focused, close: () => setFocused(false) })}
    </div>
  );
}
