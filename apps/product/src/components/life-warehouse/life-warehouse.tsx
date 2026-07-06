"use client";

import { cn } from "@daodao/ui/lib/utils";
import { format } from "date-fns";
import { useMemo } from "react";
import { PeriodSelector } from "./components";
import { TABS } from "./constants";
import { lifeWarehouseActions, useLifeWarehouseStore } from "./mock-store";
import { CorrelationsTab, DayTab, OverviewTab, TrackTab, TrendsTab } from "./tabs";
import type { TabId } from "./types";
import { getRecordsForPeriod } from "./utils";

export function LifeWarehouse() {
  const { records, activeTab, activePeriod, selectedDate } = useLifeWarehouseStore();

  const today = format(new Date(), "yyyy-MM-dd");
  const todayRecord = records[today];

  const periodRecords = useMemo(
    () => getRecordsForPeriod(records, activePeriod, today),
    [records, activePeriod, today]
  );

  const showPeriodSelector =
    activeTab === "overview" || activeTab === "correlations" || activeTab === "trends";

  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col gap-3 px-4 pb-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.value}
              onClick={() => lifeWarehouseActions.setActiveTab(tab.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-[#16B9B3] text-white"
                  : "bg-[#F5F7FA] text-[#636E72] hover:bg-[#E0E4E8]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {showPeriodSelector && (
          <PeriodSelector value={activePeriod} onChange={lifeWarehouseActions.setActivePeriod} />
        )}
      </div>

      <div className="px-4 sm:px-6">
        <TabContent
          activeTab={activeTab}
          records={records}
          periodRecords={periodRecords}
          todayRecord={todayRecord}
          selectedDate={selectedDate}
          today={today}
        />
      </div>
    </div>
  );
}

interface TabContentProps {
  activeTab: TabId;
  records: Record<string, import("./types").DailyRecord>;
  periodRecords: import("./types").DailyRecord[];
  todayRecord?: import("./types").DailyRecord;
  selectedDate: string;
  today: string;
}

function TabContent({
  activeTab,
  records,
  periodRecords,
  todayRecord,
  selectedDate,
  today,
}: TabContentProps) {
  switch (activeTab) {
    case "overview":
      return <OverviewTab records={periodRecords} todayRecord={todayRecord} />;
    case "correlations":
      return <CorrelationsTab />;
    case "trends":
      return <TrendsTab records={periodRecords} />;
    case "day":
      return (
        <DayTab
          records={records}
          selectedDate={selectedDate}
          onSelectDate={lifeWarehouseActions.setSelectedDate}
        />
      );
    case "track": {
      const trackRecord = todayRecord ?? {
        date: today,
        mood: 5,
        energy: 5,
        sleep: 0,
        steps: 0,
        focus: 0,
        exercise: 0,
        coffee: 0,
        spend: 0,
        stress: 3,
        water: 0,
        heartRate: 0,
        tags: [],
        note: "",
        intention: "",
        reflection: "",
        source: {},
      };
      return (
        <TrackTab
          record={trackRecord}
          onSetMood={(mood) => lifeWarehouseActions.setMood(today, mood)}
          onToggleTag={(tag) => {
            if (trackRecord.tags.includes(tag)) {
              lifeWarehouseActions.removeTag(today, tag);
            } else {
              lifeWarehouseActions.addTag(today, tag);
            }
          }}
          onSetNote={(note) => lifeWarehouseActions.setNote(today, note)}
        />
      );
    }
  }
}
