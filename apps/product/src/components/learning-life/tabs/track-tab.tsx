"use client";

import { Card } from "@daodao/ui/components/card";
import { Textarea } from "@daodao/ui/components/textarea";
import { ConnectedServicesGrid, MoodPicker, SectionHeader, TagToggleGroup } from "../components";
import { CUSTOM_FIELD_TYPES } from "../constants";
import type { DailyRecord } from "../types";
import { getMoodEmoji } from "../utils";

interface TrackTabProps {
  record: DailyRecord;
  onSetMood: (mood: number) => void;
  onToggleTag: (tag: string) => void;
  onSetNote: (note: string) => void;
}

export function TrackTab({ record, onSetMood, onToggleTag, onSetNote }: TrackTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionHeader title={`今天的心情 ${getMoodEmoji(record.mood)}`} />
        <div className="mt-3">
          <MoodPicker value={record.mood} onChange={onSetMood} />
        </div>
      </section>

      <section>
        <SectionHeader title="快速標籤" />
        <div className="mt-3">
          <TagToggleGroup selected={record.tags} onToggle={onToggleTag} />
        </div>
      </section>

      <section>
        <SectionHeader title="筆記" />
        <div className="mt-3">
          <Textarea
            value={record.note}
            onChange={(e) => onSetNote(e.target.value)}
            placeholder="今天發生了什麼？"
            className="min-h-[80px] resize-none border-[#E0E4E8]"
          />
        </div>
      </section>

      <section>
        <SectionHeader title="自訂欄位" />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CUSTOM_FIELD_TYPES.map((fieldType) => (
            <Card
              key={fieldType.type}
              className="cursor-pointer border-[#E0E4E8] p-3 transition-colors hover:border-[#16B9B3]"
            >
              <div className="mb-1 text-xl">{fieldType.emoji}</div>
              <div className="text-sm font-medium text-[#2D3436]">{fieldType.label}</div>
              <div className="text-xs text-[#8A9BA0]">{fieldType.description}</div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="連結的服務" />
        <div className="mt-3">
          <ConnectedServicesGrid />
        </div>
      </section>
    </div>
  );
}
