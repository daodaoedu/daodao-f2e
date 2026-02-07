"use client";

import type { ElementType } from "react";
import { cn } from "@daodao/ui/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: ElementType;
}

export const StatCard = ({ label, value, unit, icon: Icon }: StatCardProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-[18px] py-2 md:py-4",
        "bg-white border-l-[6px] border-light-cyan rounded-md"
      )}
    >
      <div className="flex flex-col">
        <span className="text-sm md:text-base text-text-dark">{label}</span>
        <span className="flex items-end gap-1 leading-none">
          <span className="text-[1.75rem] font-semibold text-logo-cyan">{value}</span>
          <span className="text-sm text-text-dark">{unit}</span>
        </span>
      </div>
      <div className="absolute right-2 top-2 hidden md:block">
        <Icon className="size-12 -rotate-12 text-bg-gray" />
      </div>
    </div>
  );
};
