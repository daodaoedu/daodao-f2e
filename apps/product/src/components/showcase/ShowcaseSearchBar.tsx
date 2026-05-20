"use client";

import { useShowcaseSuggestions } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface ShowcaseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export function ShowcaseSearchBar({ value, onChange, onSearch }: ShowcaseSearchBarProps) {
  const t = useTranslations("showcase");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestionsData } = useShowcaseSuggestions(focused && !value);
  const suggestions = suggestionsData?.data;
  const trendingKeywords = suggestions?.trending_keywords ?? [];
  const interestTags = suggestions?.interest_tags ?? [];
  const allSuggestions = [...new Set([...trendingKeywords, ...interestTags])];

  const handleClear = () => {
    onChange("");
    onSearch("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;

    e.preventDefault();
    onSearch(value);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (keyword: string) => {
    onChange(keyword);
    onSearch(keyword);
    setFocused(false);
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-2 bg-white border rounded-[8px] px-4 h-10 transition-all",
          focused ? "border-[#9fb5b8]" : "border-[#e4eae9]"
        )}
      >
        <Search className="size-4 text-text-dark/40 shrink-0" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={t("search_placeholder")}
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
            className="text-text-dark/40 hover:text-text-dark/70"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {focused && !value && allSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#C1ECFF] rounded-xl shadow-md z-20 py-2 max-h-60 overflow-y-auto">
          {trendingKeywords.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs text-text-dark/50 font-medium">{t("trending_section")}</div>
              {trendingKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-text-dark hover:bg-[#F5FFFD] transition-colors"
                  onMouseDown={() => handleSuggestionClick(kw)}
                >
                  {kw}
                </button>
              ))}
            </>
          )}
          {interestTags.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs text-text-dark/50 font-medium mt-1">{t("interest_section")}</div>
              {interestTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-text-dark hover:bg-[#F5FFFD] transition-colors"
                  onMouseDown={() => handleSuggestionClick(tag)}
                >
                  #{tag}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
