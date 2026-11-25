"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Checkbox } from "./checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface FilterMenuProps {
  /** 觸發鈕上的文字（例如「全部」或目前選的項目） */
  label: string;
  /** 有套用篩選時觸發鈕變實心 */
  active: boolean;
  /** 觸發鈕的 aria-label */
  triggerAriaLabel: string;
  /** 選單的 aria-label */
  menuAriaLabel: string;
  children: ReactNode;
}

/**
 * 下拉篩選（首頁動態牆、探索頁共用）：膠囊觸發鈕＋勾選列。
 * 單選或多選由呼叫端決定，選項用 FilterMenuItem。
 */
export function FilterMenu({
  label,
  active,
  triggerAriaLabel,
  menuAriaLabel,
  children,
}: FilterMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={triggerAriaLabel}
          className={cn(
            "inline-flex h-8 max-w-full cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm",
            active
              ? "border-primary-base bg-primary-base text-white"
              : "border-[#E4EAE9] bg-white text-text-dark/75"
          )}
        >
          <span className="min-w-0 truncate">{label}</span>
          <ChevronDown className="size-[13px] shrink-0" strokeWidth={2} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={menuAriaLabel}
        align="start"
        side="bottom"
        avoidCollisions={false}
        sideOffset={6}
        collisionPadding={16}
        className="flex max-h-[var(--radix-popover-content-available-height)] w-auto min-w-[min(220px,var(--radix-popover-content-available-width))] max-w-[min(calc(100vw-32px),var(--radix-popover-content-available-width))] flex-col gap-0.5 overflow-y-auto rounded-2xl border-[#E4EAE9] bg-white p-1.5 shadow-[0_8px_20px_rgba(15,48,54,0.12)]"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function FilterMenuItem({
  label,
  checked,
  disabled = false,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Checkbox（radix button）就在 label 內
    <label
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left text-sm text-text-dark hover:bg-[#F0F9F8]",
        checked && "bg-[#F0F9F8]",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
        className="size-4 rounded-[5px] border-[#D5E2E2] bg-white data-[state=checked]:border-primary-base data-[state=checked]:bg-primary-base [&_svg]:size-[11px] [&_svg_*]:[stroke-width:3.5]"
      />
      <span className="min-w-0 flex-1">{label}</span>
    </label>
  );
}

/** 選單內分組標題（例如「狀態」「費用」） */
export function FilterMenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pt-1.5 pb-0.5 text-xs font-medium text-text-dark/50">{children}</div>
  );
}

export function FilterMenuSeparator() {
  return <div aria-hidden="true" className="mx-2.5 my-1 h-px bg-[#E4EAE9]" />;
}
