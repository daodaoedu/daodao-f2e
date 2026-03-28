"use client";

import { cn } from "@daodao/ui/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, changeLabel, icon, className }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn("rounded-xl border border-border bg-white p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-basic-400">{title}</p>
        {icon && <div className="text-basic-300">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold text-text-dark">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {change !== undefined && (
        <div className="mt-1 flex items-center gap-1 text-sm">
          {isPositive ? (
            <ArrowUp className="size-4 text-green-500" />
          ) : (
            <ArrowDown className="size-4 text-red-500" />
          )}
          <span className={cn("font-medium", isPositive ? "text-green-600" : "text-red-600")}>
            {Math.abs(change).toFixed(1)}%
          </span>
          {changeLabel && <span className="text-basic-300">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
