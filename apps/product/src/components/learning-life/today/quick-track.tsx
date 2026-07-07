"use client";

import { Card } from "@daodao/ui/components/card";
import { cn } from "@daodao/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import { SectionHeader, TagToggleGroup } from "../components";
import { learningLifeActions } from "../mock-store";
import type { DailyRecord } from "../types";

const ENERGY_LEVELS = [
  { value: 1, emoji: "🪫", label: "沒電" },
  { value: 2, emoji: "😮‍💨", label: "偏低" },
  { value: 3, emoji: "🙂", label: "普通" },
  { value: 4, emoji: "💪", label: "不錯" },
  { value: 5, emoji: "⚡", label: "滿電" },
] as const;

interface QuickTrackProps {
  today: string;
  record?: DailyRecord;
}

/** 快速記錄：一鍵式、30 秒完成（spec 原則四：獨立於打卡的低阻力記錄流） */
export function QuickTrack({ today, record }: QuickTrackProps) {
  const energy = record?.energy ?? 0;
  const sleep = record?.sleep ?? 0;

  return (
    <section>
      <SectionHeader
        title="今天的狀態"
        action={<span className="text-xs text-[#8A9BA0]">示意資料</span>}
      />
      <Card className="mt-3 flex flex-col gap-5 border-[#E0E4E8] p-4">
        <div>
          <p className="mb-2 text-sm text-[#636E72]">精力如何？</p>
          <div className="flex gap-2">
            {ENERGY_LEVELS.map((level) => (
              <button
                type="button"
                key={level.value}
                onClick={() => learningLifeActions.setEnergy(today, level.value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl border py-2 transition-colors",
                  energy === level.value
                    ? "border-[#16B9B3] bg-[rgba(22,185,179,0.1)]"
                    : "border-[#E0E4E8] bg-white hover:border-[#16B9B3]"
                )}
              >
                <span className="text-lg">{level.emoji}</span>
                <span className="text-[10px] text-[#636E72]">{level.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-[#636E72]">昨晚睡了多久？</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="減少睡眠時數"
              onClick={() => learningLifeActions.setSleep(today, Math.max(0, sleep - 0.5))}
              className="flex size-8 items-center justify-center rounded-full border border-[#E0E4E8] text-[#636E72] hover:border-[#16B9B3]"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-16 text-center text-lg font-semibold text-[#2D3436]">
              {sleep > 0 ? `${sleep.toFixed(1)}h` : "未記錄"}
            </span>
            <button
              type="button"
              aria-label="增加睡眠時數"
              onClick={() => learningLifeActions.setSleep(today, Math.min(14, sleep + 0.5))}
              className="flex size-8 items-center justify-center rounded-full border border-[#E0E4E8] text-[#636E72] hover:border-[#16B9B3]"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-[#636E72]">今天在哪裡、什麼狀態？</p>
          <TagToggleGroup
            selected={record?.contextTags ?? []}
            onToggle={(tag) => learningLifeActions.toggleContextTag(today, tag)}
          />
        </div>
      </Card>
    </section>
  );
}
