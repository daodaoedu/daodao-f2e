"use client";

import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Card } from "@daodao/ui/components/card";
import { Flame, Sprout } from "lucide-react";
import { CheckinCard, SectionHeader } from "../components";
import { learningLifeActions } from "../mock-store";
import type { MockCheckin } from "../types";

interface TodayCheckinsProps {
  today: string;
  checkins: MockCheckin[];
  streak: number;
}

/** 今天的打卡（視覺主角）；未打卡時顯示 CTA */
export function TodayCheckins({ today, checkins, streak }: TodayCheckinsProps) {
  return (
    <section>
      <SectionHeader
        title="今天的學習"
        action={
          streak > 0 ? (
            <span className="flex items-center gap-1 text-xs text-[#FFA10B]">
              <Flame className="size-3.5" />
              連續 {streak} 天
            </span>
          ) : undefined
        }
      />
      <div className="mt-3 flex flex-col gap-3">
        {checkins.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 border-dashed border-[#E0E4E8] p-6 text-center">
            <Sprout className="size-8 text-logo-cyan" />
            <p className="text-sm text-[#636E72]">今天還沒打卡，島上在等你</p>
            <Link href="/mine">
              <Button className="rounded-full">去實踐打卡</Button>
            </Link>
            <button
              type="button"
              onClick={() => learningLifeActions.addMockCheckin(today)}
              className="text-xs text-[#8A9BA0] underline"
            >
              或先用示意打卡體驗看看
            </button>
          </Card>
        ) : (
          checkins.map((checkin) => <CheckinCard key={checkin.id} checkin={checkin} />)
        )}
      </div>
    </section>
  );
}
