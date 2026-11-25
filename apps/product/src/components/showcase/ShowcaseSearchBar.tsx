"use client";

import { useShowcaseSuggestions } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { ExpandableSearch } from "@daodao/ui/components/expandable-search";

interface ShowcaseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export function ShowcaseSearchBar({ value, onChange, onSearch }: ShowcaseSearchBarProps) {
  const t = useTranslations("app_product");

  return (
    <ExpandableSearch
      value={value}
      onChange={onChange}
      onSubmit={onSearch}
      placeholder={t("showcase_search_placeholder")}
      clearLabel={t("showcase_search_clear")}
      renderDropdown={({ focused, close }) =>
        focused && !value ? (
          <ShowcaseSuggestions
            onPick={(keyword) => {
              onChange(keyword);
              onSearch(keyword);
              close();
            }}
          />
        ) : null
      }
    />
  );
}

/** 搜尋框聚焦且還沒輸入時的建議字（熱門關鍵字、你的興趣） */
function ShowcaseSuggestions({ onPick }: { onPick: (keyword: string) => void }) {
  const t = useTranslations("app_product");
  const { data: suggestionsData } = useShowcaseSuggestions(true);
  const suggestions = suggestionsData?.data;
  const trendingKeywords = suggestions?.trending_keywords ?? [];
  const interestTags = suggestions?.interest_tags ?? [];
  const allSuggestions = [...new Set([...trendingKeywords, ...interestTags])];

  if (allSuggestions.length === 0) return null;

  return (
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
              onMouseDown={() => onPick(kw)}
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
              onMouseDown={() => onPick(tag)}
            >
              #{tag}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
