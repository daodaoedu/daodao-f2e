"use client";

import { ActionCard } from "../components/action-card";
import type { QuarterlyReportData } from "../types";

interface ActionTabProps {
  data: QuarterlyReportData;
}

export function ActionTab({ data }: ActionTabProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[#2D3436]">下季度建議行動</h3>
      {data.actions.map((action, i) => (
        <ActionCard key={action.title} action={action} index={i} />
      ))}

      <div className="mt-6 rounded-xl bg-[#E8F8F7] p-4 text-center">
        <p className="text-sm font-medium text-[#16B9B3]">每個人都是一座擁有豐富資源的島</p>
        <p className="mt-1 text-xs text-[#536166]">透過互助共學，成為一片獨立又連結的群島</p>
      </div>
    </div>
  );
}
