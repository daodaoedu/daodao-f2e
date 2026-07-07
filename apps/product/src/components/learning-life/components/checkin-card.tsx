import { Card } from "@daodao/ui/components/card";
import { CheckCircle2 } from "lucide-react";
import { CHECKIN_MOOD_META } from "../constants";
import type { MockCheckin } from "../types";

/** 打卡卡片：學習事件的視覺主角（今日/每日回顧共用） */
export function CheckinCard({ checkin }: { checkin: MockCheckin }) {
  const mood = CHECKIN_MOOD_META[checkin.mood];
  const MoodIcon = mood.icon;
  return (
    <Card className="border-[#E0E4E8] border-l-4 border-l-logo-cyan p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#2D3436]">
          <CheckCircle2 className="size-4 text-logo-cyan" />
          {checkin.practiceTitle}
        </span>
        <MoodIcon className="size-6" role="img" aria-label={mood.label} />
      </div>
      {checkin.note && <p className="text-sm leading-relaxed text-[#636E72]">{checkin.note}</p>}
      {checkin.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {checkin.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[rgba(22,185,179,0.08)] px-2 py-0.5 text-xs text-[#0E8E89]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
