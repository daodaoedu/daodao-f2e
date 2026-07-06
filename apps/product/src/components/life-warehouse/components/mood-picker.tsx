"use client";

import { cn } from "@daodao/ui/lib/utils";
import { MOOD_EMOJIS } from "../constants";

interface MoodPickerProps {
  value: number;
  onChange: (mood: number) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex justify-between">
      {MOOD_EMOJIS.map((emoji, idx) => {
        const moodValue = idx + 1;
        return (
          <button
            type="button"
            key={emoji}
            onClick={() => onChange(moodValue)}
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-xl transition-all",
              value === moodValue
                ? "scale-125 bg-[rgba(22,185,179,0.15)] ring-2 ring-[#16B9B3]"
                : "hover:scale-110 hover:bg-[#F5F7FA]"
            )}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
