"use client";

import { Card } from "@daodao/ui/components/card";
import { getCheckinStreak } from "../checkin-stats";
import { ConnectedServicesGrid, SectionHeader } from "../components";
import { CUSTOM_FIELD_EXAMPLES } from "../constants";
import type { DailyRecord, MockCheckin } from "../types";
import { QuickTrack } from "./quick-track";
import { TodayCheckins } from "./today-checkins";

interface TodayTabProps {
  today: string;
  todayRecord?: DailyRecord;
  checkins: MockCheckin[];
}

export function TodayTab({ today, todayRecord, checkins }: TodayTabProps) {
  const todayCheckins = checkins.filter((c) => c.checkinDate === today);
  const streak = getCheckinStreak(checkins, today);

  return (
    <div className="flex flex-col gap-6">
      <TodayCheckins today={today} checkins={todayCheckins} streak={streak} />
      <QuickTrack today={today} record={todayRecord} />

      <section>
        <SectionHeader
          title="自訂追蹤"
          action={<span className="text-xs text-[#8A9BA0]">規劃中</span>}
        />
        <div className="mt-3 grid grid-cols-3 gap-2 opacity-60">
          {CUSTOM_FIELD_EXAMPLES.map((field) => (
            <Card key={field.label} className="flex flex-col items-center gap-1 border-[#E0E4E8] p-3">
              <span className="text-xl">{field.emoji}</span>
              <span className="text-xs text-[#636E72]">{field.label}</span>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="連結外部服務"
          action={<span className="text-xs text-[#8A9BA0]">規劃中</span>}
        />
        <div className="mt-3">
          <ConnectedServicesGrid />
        </div>
      </section>
    </div>
  );
}
