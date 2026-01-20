"use client";

import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";

interface MoodStat {
  mood: MoodType;
  count: number;
}

interface ThoughtTag {
  tag: string;
  count: number;
}

export const CheckInRecordCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 模擬資料 - 之後替換為實際 API 資料
  const moodStats: MoodStat[] = [
    { mood: "happy", count: 3 },
    { mood: "neutral", count: 2 },
    { mood: "bored", count: 0 },
    { mood: "fine", count: 0 },
    { mood: "frustrated", count: 0 },
    { mood: "hopeless", count: 1 },
  ];

  const thoughtTags: ThoughtTag[] = [
    { tag: "有趣", count: 1 },
    { tag: "不太懂", count: 1 },
    { tag: "新概念", count: 2 },
    { tag: "受啟發", count: 1 },
    { tag: "需要思考一下", count: 1 },
    { tag: "平靜", count: 1 },
  ];

  const totalMoodCount = moodStats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div>
      <h3 className="font-medium text-text-dark mb-3">打卡紀錄</h3>
      <div className="bg-white rounded-lg px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-text-dark">統計</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="size-4.5"
            animation="none"
            aria-label={isExpanded ? "收合" : "展開"}
          >
            <ChevronUp
              className={cn(
                "size-4 text-text-dark transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </Button>
        </div>
        <div className="grid grid-cols-2">
          {/* Mood Ranking */}
          <div className="border-r border-bg-gray pr-4">
            <h4 className="text-sm font-medium text-text-dark mb-2">心情排行</h4>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((moodOption) => {
                const stat = moodStats.find((s) => s.mood === moodOption.id);
                const count = stat?.count ?? 0;
                const Emoji = moodOption.emoji;
                return (
                  <div key={moodOption.id} className="flex flex-col items-center gap-1">
                    <div className="relative w-1.5 h-15 bg-bg-gray rounded-full">
                      <div
                        className="absolute bottom-0 left-0 w-full h-full bg-logo-cyan rounded-full origin-bottom transition-transform duration-300"
                        style={{
                          transform: `scaleY(${(count / totalMoodCount) * 100}%)`,
                        }}
                      />
                    </div>
                    <Emoji className="size-4" />
                    <div
                      className={cn(
                        "text-xs text-center text-light-gray",
                        count > 0 && " text-text-dark"
                      )}
                    >
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Thoughts */}
          <div className="pl-4">
            <h4 className="text-sm font-medium text-text-dark">我的想法</h4>
            <div
              className={cn(
                "flex flex-wrap gap-2 transition-all",
                !isExpanded && "max-h-20 overflow-hidden"
              )}
            >
              {thoughtTags.map((thought) => (
                <Badge
                  key={thought.tag}
                  variant={thought.tag === "新概念" ? "outline-logo" : "very-light-blue"}
                  size="sm"
                  className={cn(
                    "text-sm py-[3px] rounded",
                    thought.tag === "新概念" && "font-medium"
                  )}
                >
                  {thought.tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
