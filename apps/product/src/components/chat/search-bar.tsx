"use client";

import { selectChatSearch, useChatSearch } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// POC 訊息.dc.html：28px 圓形、slate/0.6，停用時 0.3
const NAV_BUTTON =
  "size-7 shrink-0 rounded-full text-[oklch(0.445_0.056_192/0.6)] hover:text-[oklch(0.445_0.056_192/0.6)] disabled:opacity-30 [&_svg]:size-[15px]";

interface SearchBarProps {
  roomId: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMessage?: (messageId: number) => void;
}

export function SearchBar({ roomId, isOpen, onClose, onNavigateToMessage }: SearchBarProps) {
  const t = useTranslations("messages");
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce input → query
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setDebouncedQuery(null);
      setCurrentIndex(0);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
      setCurrentIndex(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: searchData } = useChatSearch(isOpen ? roomId : null, debouncedQuery);
  const { items: results, total } = selectChatSearch(searchData);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setInputValue("");
      setDebouncedQuery(null);
      setCurrentIndex(0);
    }
  }, [isOpen]);

  // Navigate to current result
  useEffect(() => {
    if (results.length > 0 && currentIndex < results.length) {
      const target = results[currentIndex];
      if (target) onNavigateToMessage?.(target.id);
    }
  }, [currentIndex, results, onNavigateToMessage]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(results.length - 1, i + 1));
  }, [results.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (results.length > 0) handleNext();
      }
      if (e.key === "Escape") {
        onClose();
      }
    },
    [results.length, handleNext, onClose]
  );

  const handleClose = useCallback(() => {
    setInputValue("");
    setDebouncedQuery(null);
    setCurrentIndex(0);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-chat-search-bar
      className="flex shrink-0 items-center gap-2.5 border-b border-[#E4EAE9] bg-white px-7 py-2.5"
    >
      <Search className="size-4 shrink-0 text-[oklch(0.445_0.056_192/0.45)]" aria-hidden />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("search_placeholder")}
        aria-label={t("search_messages")}
        className="min-w-0 flex-1 border-0 bg-transparent px-[2px] py-px text-sm text-[oklch(0.287_0.041_210.8)] outline-none placeholder:text-[oklch(0.445_0.056_192/0.4)]"
      />

      {/* Result indicator */}
      {debouncedQuery && (
        <span className="shrink-0 whitespace-nowrap text-xs text-[oklch(0.445_0.056_192/0.55)]">
          {total === 0
            ? t("search_no_results")
            : t("search_result_position", {
                current: currentIndex + 1,
                total,
              })}
        </span>
      )}

      {/* Navigation arrows（POC：搜尋列開啟時一直顯示，沒有結果時淡化停用） */}
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={NAV_BUTTON}
          onClick={handlePrev}
          disabled={total === 0 || currentIndex <= 0}
          aria-label={t("search_prev")}
        >
          <ChevronUp />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={NAV_BUTTON}
          onClick={handleNext}
          disabled={total === 0 || currentIndex >= total - 1}
          aria-label={t("search_next")}
        >
          <ChevronDown />
        </Button>
      </div>

      {/* Close */}
      <Button
        variant="ghost"
        size="icon"
        className={NAV_BUTTON}
        onClick={handleClose}
        aria-label={t("search_close")}
      >
        <X />
      </Button>
    </div>
  );
}
