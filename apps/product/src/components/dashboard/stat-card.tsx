"use client";

import { cn } from "@daodao/ui/lib/utils";
import * as React from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-4 py-3",
        "bg-white border-l-[6px] border-light-cyan rounded-md"
      )}
    >
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xl font-semibold">{value}</span>
      </div>
      <div className="absolute right-2 top-2">
        <Icon className="size-12 -rotate-12 text-bg-gray" />
      </div>
    </div>
  );
};
