"use client";

import { useChatSearch } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchBarProps {
  roomId: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMessage?: (messageId: number) => void;
}

export function SearchBar({
  roomId,
  isOpen,
  onClose,
  onNavigateToMessage,
}: SearchBarProps) {
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

  const { data: searchData } = useChatSearch(
    isOpen ? roomId : null,
    debouncedQuery,
  );
  const results = searchData?.items ?? [];
  const total = searchData?.total ?? 0;

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
    [results.length, handleNext, onClose],
  );

  const handleClose = useCallback(() => {
    setInputValue("");
    setDebouncedQuery(null);
    setCurrentIndex(0);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="flex items-center gap-2 border-b border-[#E4EAE9] bg-white px-3 py-2">
      <Search className="size-4 text-text-dark/40 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("search_placeholder")}
        className="flex-1 min-w-0 bg-transparent text-sm text-text-dark placeholder:text-text-dark/30 outline-none"
      />

      {/* Result indicator */}
      {debouncedQuery && (
        <span className="text-xs text-text-dark/50 whitespace-nowrap shrink-0">
          {total === 0
            ? t("search_no_results")
            : t("search_result_position", {
                current: currentIndex + 1,
                total,
              })}
        </span>
      )}

      {/* Navigation arrows */}
      {total > 0 && (
        <div className="flex items-center shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handlePrev}
            disabled={currentIndex <= 0}
          >
            <ChevronUp className={cn("size-4", currentIndex <= 0 ? "text-gray-300" : "text-gray-500")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleNext}
            disabled={currentIndex >= total - 1}
          >
            <ChevronDown className={cn("size-4", currentIndex >= total - 1 ? "text-gray-300" : "text-gray-500")} />
          </Button>
        </div>
      )}

      {/* Close */}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        onClick={handleClose}
      >
        <X className="size-4 text-gray-400" />
      </Button>
    </div>
  );
}
