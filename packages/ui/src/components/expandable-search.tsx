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
  /** 展開時顯示在輸入框下方的內容（例如搜尋建議） */
  renderDropdown?: (state: ExpandableSearchDropdownState) => ReactNode;
  className?: string;
}

/**
 * 可展開的圓形搜尋列（首頁、探索頁共用）：
 * 收合時是放大鏡圓鈕，點了展開成輸入框並佔滿所在列的剩餘寬度；有輸入值時保持展開。
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

  const searchBarClassName = cn(
    "flex items-center bg-white border rounded-full overflow-hidden transition-all duration-300 ease-in-out",
    expanded
      ? "w-full border-[#9fb5b8] px-4 h-10"
      : "w-8 h-8 border-[#e4eae9] cursor-pointer justify-center"
  );

  const searchBarContent = (
    <>
      <Search
        className={cn(
          "shrink-0 transition-all duration-200",
          expanded ? "size-4 text-text-dark/40 mr-2" : "size-4 text-text-dark/60"
        )}
      />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        tabIndex={expanded ? 0 : -1}
        className={cn(
          "h-auto rounded-none border-0 bg-transparent px-0 py-0 text-sm text-text-dark outline-none placeholder:text-text-dark/40 hover:border-0 focus-visible:border-0 focus-visible:px-0 focus-visible:py-0 focus-visible:ring-0 transition-all duration-300",
          expanded ? "flex-1 opacity-100" : "w-0 opacity-0 pointer-events-none"
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </>
  );

  return (
    // 展開時在「搜尋 + 篩選」列中佔滿剩餘寬度
    <div className={cn("relative", expanded && "min-w-0 flex-1", className)}>
      {expanded ? (
        <div className={searchBarClassName}>
          {searchBarContent}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 text-text-dark/40 hover:text-text-dark/70 transition-colors"
              aria-label={clearLabel}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          className={searchBarClassName}
          onClick={expand}
          aria-label={placeholder}
        >
          {searchBarContent}
        </button>
      )}

      {expanded && renderDropdown?.({ focused, close: () => setFocused(false) })}
    </div>
  );
}
