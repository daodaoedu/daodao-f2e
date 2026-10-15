"use client";

import type { ChatMessageType } from "@daodao/api";
import { useMemo } from "react";
import { CHAT_GROUP_GAP_MS } from "@/constants/chat";
import { chatDateKey } from "@/utils/chat-format";

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

/** Asia/Taipei calendar date key (UTC+8, no DST)；不受執行環境時區影響 */
const toTaipeiDateKey = chatDateKey;

/** 訊息時間（氣泡下方）：Asia/Taipei 的 HH:mm，不受執行環境時區影響；日期交給日期分隔線 */
export function formatChatClock(iso: string): string {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const utc8 = new Date(ms + 8 * 60 * 60 * 1000);
  const hh = String(utc8.getUTCHours()).padStart(2, "0");
  const mm = String(utc8.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function canGroup(a: ChatMessageType, b: ChatMessageType): boolean {
  if (a.kind !== "text" || b.kind !== "text") return false;
  if (a.author?.userId !== b.author?.userId) return false;
  if (!a.author || !b.author) return false;
  const gap = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  return gap < CHAT_GROUP_GAP_MS;
}

// ─── Timeline ────────────────────────────────────────────

/**
 * 歷史 + 增量輪詢合併成時間軸。
 * hiddenIds：本機剛刪除、還在等 server／輪詢確認的訊息，立刻從時間軸拿掉（daodao#154 J-06d）
 */
export function buildChatTimeline(
  historyMessages: ChatMessageType[],
  delta: DeltaData | null,
  hiddenIds?: ReadonlySet<number>
): TimelineItem[] {
  const map = new Map<number, ChatMessageType>();

  for (const m of historyMessages) map.set(m.id, m);

  if (delta) {
    for (const m of delta.messages) map.set(m.id, m);
    for (const m of delta.changed) map.set(m.id, m);
    for (const id of delta.deletedIds) map.delete(id);
  }

  if (hiddenIds) for (const id of hiddenIds) map.delete(id);

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
      prev !== undefined && toTaipeiDateKey(prev.createdAt) === dateKey && canGroup(prev, msg);
    const groupedWithNext =
      next !== undefined && toTaipeiDateKey(next.createdAt) === dateKey && canGroup(msg, next);

    items.push({
      type: "message",
      message: msg,
      isGroupStart: !groupedWithPrev,
      isGroupEnd: !groupedWithNext,
    });
  }

  return items;
}

// ─── Hook ────────────────────────────────────────────────

export function useChatTimeline(
  historyMessages: ChatMessageType[],
  delta: DeltaData | null,
  hiddenIds?: ReadonlySet<number>
): TimelineItem[] {
  return useMemo(
    () => buildChatTimeline(historyMessages, delta, hiddenIds),
    [historyMessages, delta, hiddenIds]
  );
}
