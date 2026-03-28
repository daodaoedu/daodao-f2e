"use client";

import { useShowcaseSuggestions } from "@daodao/api";
import { cn } from "@daodao/ui/lib/utils";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface ShowcaseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export function ShowcaseSearchBar({ value, onChange, onSearch }: ShowcaseSearchBarProps) {
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
    if (e.key === "Enter") {
      onSearch(value);
      inputRef.current?.blur();
    }
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
          "flex items-center gap-2 bg-white border rounded-xl px-3 py-2.5 transition-all",
          focused ? "border-gray-400 shadow-sm" : "border-gray-300"
        )}
      >
        <Search className="size-4 text-text-dark/40 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder=""
          className="flex-1 text-sm text-text-dark outline-none bg-transparent placeholder:text-text-dark/40"
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
              <div className="px-3 py-1 text-xs text-text-dark/50 font-medium">近期熱門</div>
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
              <div className="px-3 py-1 text-xs text-text-dark/50 font-medium mt-1">你的興趣</div>
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
