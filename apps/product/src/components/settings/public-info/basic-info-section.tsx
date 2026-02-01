"use client";

import { checkCustomIdAvailability } from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircleIcon, ChevronDownIcon, LoaderIcon, XCircleIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PublicInfoFormValues } from "./schema";

interface IBasicInfoSectionProps {
  form: UseFormReturn<PublicInfoFormValues>;
  initialCustomId?: string;
}

export const BasicInfoSection = ({ form, initialCustomId }: IBasicInfoSectionProps) => {
  const locale = useLocale();
  const t = useTranslations();

  // customId 即時檢查狀態
  const [customIdStatus, setCustomIdStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 取得城市選項
  const cityOptions = useMemo(() => {
    const cities: Record<string, string> = t.raw("cities") as Record<string, string>;
    return Object.entries(cities)
      .map(([key, value]) => ({
        value: key,
        label: value,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, locale === "en" ? "en" : "zh-TW"));
  }, [t, locale]);

  // customId 即時檢查函數（debounced）
  const checkCustomId = useCallback(async (customId: string) => {
    // 清除之前的 timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // 如果是空的或與原始值相同，不檢查
    if (!customId || customId === initialCustomId) {
      setCustomIdStatus("idle");
      return;
    }

    // 本地格式驗證（基本格式檢查）
    const customIdRegex = /^[a-z0-9][a-z0-9_-]*[a-z0-9]$|^[a-z0-9]$/i;
    if (customId.length < 3 || customId.length > 50 || !customIdRegex.test(customId)) {
      setCustomIdStatus("idle");
      return;
    }

    setCustomIdStatus("checking");

    // debounce 300ms
    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await checkCustomIdAvailability(customId);
        if (response.data?.data?.available) {
          setCustomIdStatus("available");
        } else {
          setCustomIdStatus("unavailable");
          form.setError("customId", {
            type: "server",
            message: "此使用者 ID 已被使用",
          });
        }
      } catch {
        setCustomIdStatus("idle");
      }
    }, 300);
  }, [initialCustomId, form]);

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      {/* 名稱 */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">
              名稱<span className="text-red ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="請輸入公開顯示的名稱"
                className={cn(form.formState.errors.name && "border-red focus-visible:border-red")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 使用者 ID */}
      <FormField
        control={form.control}
        name="customId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">
              使用者 ID<span className="text-red ml-1">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="請輸入使用者 ID"
                  className={cn(
                    "pr-10",
                    form.formState.errors.customId && "border-red focus-visible:border-red",
                    customIdStatus === "available" && "border-green focus-visible:border-green"
                  )}
                  onBlur={(e) => {
                    field.onBlur();
                    checkCustomId(e.target.value);
                  }}
                  onChange={(e) => {
                    field.onChange(e);
                    // 當值改變時，重置狀態（如果與原始值相同則設為 idle）
                    if (e.target.value === initialCustomId) {
                      setCustomIdStatus("idle");
                    } else if (customIdStatus !== "idle") {
                      setCustomIdStatus("idle");
                    }
                  }}
                />
                {/* 狀態指示器 */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {customIdStatus === "checking" && (
                    <LoaderIcon className="size-4 text-light-gray animate-spin" />
                  )}
                  {customIdStatus === "available" && (
                    <CheckCircleIcon className="size-4 text-green" />
                  )}
                  {customIdStatus === "unavailable" && (
                    <XCircleIcon className="size-4 text-red" />
                  )}
                </div>
              </div>
            </FormControl>
            <FormDescription className="text-xs text-light-gray mt-1">
              ID 開頭及結尾僅可使用字符英文字母 (a-z) 與數字。中間可包含底線 (_) 與連字符 (-), 最少
              3 個字符, 最多 50 個字符。
              {customIdStatus === "available" && (
                <span className="text-green ml-1">✓ 此 ID 可以使用</span>
              )}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 居住地 */}
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">居住地</FormLabel>
            <FormControl>
              <CityCombobox
                value={field.value || ""}
                options={cityOptions}
                onChange={(value) => {
                  field.onChange(value || undefined);
                  field.onBlur();
                }}
                invalid={!!form.formState.errors.location}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

interface ICityOption {
  value: string;
  label: string;
}

interface ICityComboboxProps {
  value: string;
  options: ICityOption[];
  onChange: (value: string) => void;
  invalid?: boolean;
}

const CityCombobox = ({ value, options, onChange, invalid }: ICityComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 取得選中的選項標籤
  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  // 過濾選項
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // 當 Popover 打開時，聚焦到輸入框
  useEffect(() => {
    if (open && inputRef.current) {
      // 延遲一下確保 Popover 已經完全打開
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (!open) {
      // 關閉時清空搜尋並重置高亮
      setSearchQuery("");
      setHighlightedIndex(0);
    }
  }, [open]);

  // 處理選項點擊
  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
    setSearchQuery("");
    setHighlightedIndex(0);
  };

  // 處理鍵盤導航
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSearchQuery("");
      setHighlightedIndex(0);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const nextIndex = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        // 滾動到可見區域
        optionRefs.current[nextIndex]?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
        return nextIndex;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const nextIndex = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        // 滾動到可見區域
        optionRefs.current[nextIndex]?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
        return nextIndex;
      });
    } else if (e.key === "Enter" && filteredOptions.length > 0) {
      e.preventDefault();
      const selectedValue = filteredOptions[highlightedIndex]?.value;
      if (selectedValue) {
        handleSelectOption(selectedValue);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-bg-gray hover:border-logo-cyan bg-background text-sm",
            "px-4 py-2 focus-visible:px-[15px] focus-visible:py-[9px]",
            "focus-visible:border-2 focus-visible:border-logo-cyan focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#DEF5F5]",
            "disabled:cursor-not-allowed disabled:border-bg-gray disabled:bg-very-light-gray disabled:text-light-gray",
            invalid && "border-red",
            !selectedOption && "text-light-gray"
          )}
          aria-invalid={invalid}
        >
          <span className="flex-1 text-left truncate">
            {selectedOption ? selectedOption.label : "請選擇"}
          </span>
          <ChevronDownIcon className="size-4 opacity-50 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col">
          {/* 搜尋輸入框 */}
          <div className="p-2 border-b border-bg-gray">
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="搜尋城市..."
              className="h-9"
            />
          </div>

          {/* 選項列表 */}
          <div ref={listRef} className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-light-gray">沒有找到符合的城市</div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => handleSelectOption(option.value)}
                  className={cn(
                    "w-full flex items-center rounded-sm py-1.5 px-2 text-sm text-left",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground outline-hidden",
                    "transition-colors",
                    "city-option-item",
                    highlightedIndex === index && "bg-accent text-accent-foreground"
                  )}
                  style={{
                    contentVisibility: "auto",
                    containIntrinsicSize: "0 36px",
                  }}
                >
                  <span className={cn("flex-1", value === option.value && "font-medium")}>
                    {option.label}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
