"use client";

import { cn } from "@daodao/ui/lib/utils";
import type * as React from "react";

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const StatCard = ({ label, value, unit, icon: Icon }: StatCardProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-[18px] py-4",
        "bg-white border-l-[6px] border-light-cyan rounded-md"
      )}
    >
      <div className="flex flex-col">
        <span className="text-text-dark">{label}</span>
        <span className="flex items-baseline gap-1">
          <span className="text-[1.75rem] font-semibold text-logo-cyan">{value}</span>
          <span className="text-sm text-text-dark">{unit}</span>
        </span>
      </div>
      <div className="absolute right-2 top-2">
        <Icon className="size-12 -rotate-12 text-bg-gray" />
      </div>
    </div>
  );
};
