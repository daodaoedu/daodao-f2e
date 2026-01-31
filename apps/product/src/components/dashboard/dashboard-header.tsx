"use client";

import { format } from "date-fns";
import { StatCard } from "./stat-card";

interface Stat {
  label: string;
  value: string;
  unit: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface DashboardHeaderProps {
  stats: Stat[];
}

export const DashboardHeader = ({ stats }: DashboardHeaderProps) => {
  const today = new Date();

  return (
    <div className="hidden max-w-[640px] pt-4 px-5 mx-auto mb-10">
      <time className="block mb-3">
        <div className="text-[1.375rem] text-light-gray">{format(today, "yyyy")}</div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1">
            <span className="text-4xl text-text-dark font-semibold">{format(today, "M")}</span>
            <span className="mt-1 text-[1.375rem] text-text-dark font-medium">月</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-4xl text-text-dark font-semibold">{format(today, "d")}</span>
            <span className="mt-1 text-[1.375rem] text-text-dark font-medium">日</span>
          </span>
        </div>
      </time>
      <div className="flex gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex-1">
            <StatCard label={stat.label} value={stat.value} unit={stat.unit} icon={stat.icon} />
          </div>
        ))}
      </div>
    </div>
  );
};
