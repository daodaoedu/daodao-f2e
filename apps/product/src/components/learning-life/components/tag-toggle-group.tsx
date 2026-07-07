"use client";

import { cn } from "@daodao/ui/lib/utils";
import { PRESET_TAGS } from "../constants";

interface TagToggleGroupProps {
  selected: string[];
  onToggle: (tag: string) => void;
}

export function TagToggleGroup({ selected, onToggle }: TagToggleGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_TAGS.map((tag) => {
        const isActive = selected.includes(tag);
        return (
          <button
            type="button"
            key={tag}
            onClick={() => onToggle(tag)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "border-[#16B9B3] bg-[rgba(22,185,179,0.1)] text-[#16B9B3]"
                : "border-[#E0E4E8] bg-white text-[#636E72] hover:border-[#16B9B3]"
            )}
          >
            #{tag}
          </button>
        );
      })}
    </div>
  );
}
