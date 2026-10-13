import type { ChatMessageType } from "@daodao/api";
import { describe, expect, it } from "vitest";
import { buildChatTimeline, formatChatClock } from "../use-chat-timeline";

const base: ChatMessageType = {
  id: 20,
  roomId: 9372,
  kind: "text",
  body: "[QA #154] 第一則",
  metadata: null,
  author: { userId: 2, nickname: "小許", avatar: null, isHost: true },
  replyTo: null,
  likeCount: 0,
  likedByMe: false,
  isPinned: false,
  pinnedAt: null,
  editedAt: null,
  createdAt: "2026-10-10T01:00:00.000Z",
  updatedAt: "2026-10-10T01:00:00.000Z",
};

const msg = (id: number, body = `#${id}`): ChatMessageType => ({
  ...base,
  id,
  body,
  createdAt: new Date(Date.parse(base.createdAt) + id * 1000).toISOString(),
});

const ids = (items: ReturnType<typeof buildChatTimeline>) =>
  items.flatMap((i) => (i.type === "message" ? [i.message.id] : []));

const noDelta = { messages: [], changed: [], deletedIds: [] };

describe("buildChatTimeline", () => {
  it("merges history with the delta poll and drops server-confirmed deletions", () => {
    const delta = { messages: [msg(23)], changed: [], deletedIds: [21] };
    expect(ids(buildChatTimeline([msg(21), msg(22)], delta))).toEqual([22, 23]);
  });

  // daodao#154 regression（J-06d）：刪除 204 後訊息仍留在時間軸，要等下一次輪詢或重新整理才消失。
  // 本機刪除的 id 要立刻從時間軸拿掉，不論訊息來自歷史還是增量輪詢。
  it("hides a locally deleted message that came from history", () => {
    expect(ids(buildChatTimeline([msg(21), msg(22)], noDelta, new Set([22])))).toEqual([21]);
  });

  it("hides a locally deleted message that only exists in the delta poll", () => {
    const delta = { messages: [msg(24)], changed: [], deletedIds: [] };
    expect(ids(buildChatTimeline([msg(23)], delta, new Set([24])))).toEqual([23]);
  });

  it("re-groups neighbours after a hidden message is removed", () => {
    const items = buildChatTimeline([msg(21), msg(22), msg(23)], null, new Set([22]));
    const messages = items.filter((i) => i.type === "message");
    expect(messages.map((m) => [m.message.id, m.isGroupStart, m.isGroupEnd])).toEqual([
      [21, true, false],
      [23, false, true],
    ]);
  });

  // 日期分隔以 Asia/Taipei 日曆日計算，不受執行環境時區影響（原本用 date-fns format 會吃本機時區）
  it("splits days by the Asia/Taipei calendar regardless of the runtime time zone", () => {
    const late = { ...msg(30), createdAt: "2026-10-10T15:59:00.000Z" }; // Taipei 10/10 23:59
    const early = { ...msg(31), createdAt: "2026-10-10T16:01:00.000Z" }; // Taipei 10/11 00:01
    const dates = buildChatTimeline([late, early], null).flatMap((i) =>
      i.type === "date-separator" ? [i.date] : []
    );
    expect(dates).toEqual(["2026/10/10", "2026/10/11"]);
  });

  it("returns an empty timeline when every message is hidden", () => {
    expect(buildChatTimeline([msg(21)], null, new Set([21]))).toEqual([]);
  });
});

// daodao#154 POC 對齊：訊息時間在氣泡下方顯示 Asia/Taipei 的 HH:mm（日期由日期分隔線表示），
// 不受執行環境時區影響。
describe("formatChatClock", () => {
  it("formats as Asia/Taipei HH:mm", () => {
    expect(formatChatClock("2026-10-10T01:05:00.000Z")).toBe("09:05");
    expect(formatChatClock("2026-10-10T03:48:59.888Z")).toBe("11:48");
  });

  it("rolls over to the next Taipei day correctly", () => {
    expect(formatChatClock("2026-10-10T16:30:00.000Z")).toBe("00:30");
  });

  it("returns an empty string for an unparsable timestamp", () => {
    expect(formatChatClock("not-a-date")).toBe("");
  });
});
