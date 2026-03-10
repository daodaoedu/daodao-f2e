"use client";

import { useState } from "react";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";

function Toggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-logo-cyan" : "bg-[#D4E8E6]"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export const InteractionSettings = () => {
  const [isPracticePublic, setIsPracticePublic] = useState(true);

  const handleToggle = (value: boolean) => {
    setIsPracticePublic(value);
    toast.success(value ? "已公開你的實踐" : "已將實踐設為不公開");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E4EAE9]">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-dark">公開我的實踐</p>
            <p className="text-xs text-[#9FB5B8] mt-0.5 leading-relaxed">
              開啟後，你的實踐將可以被搜尋展示
            </p>
          </div>
          <Toggle checked={isPracticePublic} onCheckedChange={handleToggle} />
        </div>
      </div>
    </div>
  );
};
