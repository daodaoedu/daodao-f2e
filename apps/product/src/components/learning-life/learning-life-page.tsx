"use client";

import { cn } from "@daodao/ui/lib/utils";
import { format } from "date-fns";
import { TABS } from "./constants";
import { learningLifeActions, useLearningLifeStore } from "./mock-store";
import { TodayTab } from "./today/today-tab";

export function LearningLifePage() {
  const { activeTab, records, checkins } = useLearningLifeStore();
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.value}
            onClick={() => learningLifeActions.setActiveTab(tab.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "bg-logo-cyan text-white"
                : "bg-[#F5F7FA] text-[#636E72] hover:bg-[#E0E4E8]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "today" ? (
        <TodayTab today={today} todayRecord={records[today]} checkins={checkins} />
      ) : (
        <p className="py-12 text-center text-sm text-[#8A9BA0]">洞察功能即將登場</p>
      )}
    </div>
  );
}
