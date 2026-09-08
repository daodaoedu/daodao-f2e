"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import type { ChatMessageType } from "@daodao/api";
import { CHAT_GROUP_GAP_MS } from "@/constants/chat";

// ─── Types ───────────────────────────────────────────────

export type TimelineDateSeparator = { type: "date-separator"; date: string };
export type TimelineMessage = {
  type: "message";
  message: ChatMessageType;
  isGroupStart: boolean;
  isGroupEnd: boolean;
};
export type TimelineItem = TimelineDateSeparator | TimelineMessage;

interface DeltaData {
  messages: ChatMessageType[];
  changed: ChatMessageType[];
  deletedIds: number[];
}

// ─── Helpers ─────────────────────────────────────────────

/** Asia/Taipei calendar date key (UTC+8, no DST) */
function toTaipeiDateKey(iso: string): string {
  const d = new Date(iso);
  const utc8 = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return format(utc8, "yyyy/MM/dd");
}

function canGroup(a: ChatMessageType, b: ChatMessageType): boolean {
  if (a.kind !== "text" || b.kind !== "text") return false;
  if (a.author?.userId !== b.author?.userId) return false;
  if (!a.author || !b.author) return false;
  const gap =
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  return gap < CHAT_GROUP_GAP_MS;
}

// ─── Hook ────────────────────────────────────────────────

export function useChatTimeline(
  historyMessages: ChatMessageType[],
  delta: DeltaData | null,
): TimelineItem[] {
  return useMemo(() => {
    const map = new Map<number, ChatMessageType>();

    for (const m of historyMessages) map.set(m.id, m);

    if (delta) {
      for (const m of delta.messages) map.set(m.id, m);
      for (const m of delta.changed) map.set(m.id, m);
      for (const id of delta.deletedIds) map.delete(id);
    }

    const sorted = Array.from(map.values()).sort((a, b) => a.id - b.id);
    if (sorted.length === 0) return [];

    const items: TimelineItem[] = [];
    let prevDateKey = "";

    for (let i = 0; i < sorted.length; i++) {
      const msg = sorted[i]!;
      const dateKey = toTaipeiDateKey(msg.createdAt);

      if (dateKey !== prevDateKey) {
        items.push({ type: "date-separator", date: dateKey });
        prevDateKey = dateKey;
      }

      const prev = i > 0 ? sorted[i - 1] : undefined;
      const next = i < sorted.length - 1 ? sorted[i + 1] : undefined;

      const groupedWithPrev =
        prev !== undefined &&
        toTaipeiDateKey(prev.createdAt) === dateKey &&
        canGroup(prev, msg);
      const groupedWithNext =
        next !== undefined &&
        toTaipeiDateKey(next.createdAt) === dateKey &&
        canGroup(msg, next);

      items.push({
        type: "message",
        message: msg,
        isGroupStart: !groupedWithPrev,
        isGroupEnd: !groupedWithNext,
      });
    }

    return items;
  }, [historyMessages, delta]);
}
