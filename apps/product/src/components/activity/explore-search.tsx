"use client";

import { useTranslations } from "@daodao/i18n";
import { Search, X } from "lucide-react";

interface ExploreSearchProps {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}

export const ExploreSearch = ({ value, onChange, onClear }: ExploreSearchProps) => {
  const t = useTranslations("explore_activities");

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-dark/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("search_placeholder")}
        className="h-10 w-full rounded-full border border-[#DCEBEA] bg-white pl-10 pr-10 text-sm text-text-dark placeholder:text-text-dark/40 focus:border-logo-cyan focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label={t("search_clear")}
          className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#E4EAE9] text-text-dark/60 transition-colors hover:bg-[#D4E5E4]"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
};
