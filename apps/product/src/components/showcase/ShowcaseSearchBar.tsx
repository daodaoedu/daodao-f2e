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
  const t = useTranslations("app_product");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const expanded = focused || !!value;

  const { data: suggestionsData } = useShowcaseSuggestions(expanded && focused && !value);
  const suggestions = suggestionsData?.data;
  const trendingKeywords = suggestions?.trending_keywords ?? [];
  const interestTags = suggestions?.interest_tags ?? [];
  const allSuggestions = [...new Set([...trendingKeywords, ...interestTags])];

  const expand = () => {
    setFocused(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

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

  const searchBarClassName = cn(
    "flex items-center bg-white border rounded-full overflow-hidden transition-all duration-300 ease-in-out",
    expanded
      ? "w-full border-[#9fb5b8] px-4 h-10"
      : "w-10 h-10 border-[#e4eae9] cursor-pointer justify-center"
  );

  const searchBarContent = (
    <>
      <Search
        className={cn(
          "shrink-0 transition-all duration-200",
          expanded ? "size-4 text-text-dark/40 mr-2" : "size-[18px] text-text-dark/60"
        )}
      />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={t("showcase_search_placeholder")}
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
    <div className="relative">
      {expanded ? (
        <div className={searchBarClassName}>
          {searchBarContent}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 text-text-dark/40 hover:text-text-dark/70 transition-colors"
              aria-label={t("showcase_search_clear")}
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
          aria-label={t("showcase_search_placeholder")}
        >
          {searchBarContent}
        </button>
      )}

      {/* Suggestions dropdown */}
      {expanded && focused && !value && allSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#C1ECFF] rounded-xl shadow-md z-20 py-2 max-h-60 overflow-y-auto">
          {trendingKeywords.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs text-text-dark/50 font-medium">
                {t("showcase_recent_hot")}
              </div>
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
              <div className="px-3 py-1 text-xs text-text-dark/50 font-medium mt-1">
                {t("showcase_your_interests")}
              </div>
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
