import { CalendarCheck, Rss, ThumbsUp } from "lucide-react";
import type { FeedReasonType } from "@daodao/api";

interface FeedLabelProps {
  feedReason: FeedReasonType;
  userName?: string;
  practiceTitle?: string;
  latestActorName?: string;
}

export function FeedLabel({ feedReason, userName, practiceTitle, latestActorName }: FeedLabelProps) {
  if (feedReason === "new_practice") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mb-1.5 px-1">
        <ThumbsUp className="size-3.5 shrink-0" />
        <span>{userName ?? "某人"} 發布了新實踐</span>
      </div>
    );
  }

  if (feedReason === "new_release") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mb-1.5 px-1">
        <Rss className="size-3.5 shrink-0" />
        <span>最新發布</span>
      </div>
    );
  }

  if (feedReason === "checked_in") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mb-1.5 px-1">
        <CalendarCheck className="size-3.5 shrink-0" />
        <span>
          {userName ?? "某人"} 在 {practiceTitle ?? "實踐"} 打卡
        </span>
      </div>
    );
  }

  if (feedReason === "cheered") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mb-1.5 px-1">
        <ThumbsUp className="size-3.5 shrink-0" />
        <span>{latestActorName ?? "某人"} 表達了加油</span>
      </div>
    );
  }

  return null;
}
