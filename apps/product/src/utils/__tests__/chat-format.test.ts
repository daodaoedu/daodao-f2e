import { describe, expect, it } from "vitest";
import {
  chatDateKey,
  chatDayLabelParts,
  chatRoomPreview,
  chatRoomTimeLabel,
  chatShortDate,
} from "../chat-format";

// daodao#154 POC 對齊（訊息.dc.html）：日期分隔「8 月 6 日 週三」、聊天室列表時間「剛剛／昨天／週二」、
// 預覽「小海：…」「你：…」。全部以 Asia/Taipei 計算，不受執行環境時區影響。

describe("chatDateKey", () => {
  it("uses the Asia/Taipei calendar day regardless of the runtime time zone", () => {
    expect(chatDateKey("2026-10-10T15:59:59.000Z")).toBe("2026/10/10");
    expect(chatDateKey("2026-10-10T16:00:00.000Z")).toBe("2026/10/11");
  });
});

describe("chatDayLabelParts", () => {
  it("returns month, day and the zh-TW weekday for the divider", () => {
    expect(chatDayLabelParts("2026/08/06", "zh-TW")).toEqual({
      month: 8,
      day: 6,
      weekday: "週四",
      monthName: "8月",
    });
  });

  it("returns English short weekday and month names", () => {
    expect(chatDayLabelParts("2026/10/11", "en")).toEqual({
      month: 10,
      day: 11,
      weekday: "Sun",
      monthName: "Oct",
    });
  });
});

describe("chatRoomTimeLabel", () => {
  const now = "2026-10-11T04:00:00.000Z"; // Taipei 2026/10/11 (Sun) 12:00

  it("is 'just now' within a minute", () => {
    expect(chatRoomTimeLabel("2026-10-11T03:59:30.000Z", now, "zh-TW")).toEqual({
      kind: "just_now",
    });
  });

  it("shows HH:mm (Taipei) earlier the same day", () => {
    expect(chatRoomTimeLabel("2026-10-11T01:05:00.000Z", now, "zh-TW")).toEqual({
      kind: "time",
      value: "09:05",
    });
  });

  it("is 'yesterday' on the previous Taipei day, even across UTC midnight", () => {
    // Taipei 2026/10/10 23:30 = UTC 15:30
    expect(chatRoomTimeLabel("2026-10-10T15:30:00.000Z", now, "zh-TW")).toEqual({
      kind: "yesterday",
    });
  });

  it("shows the weekday within the last 7 days", () => {
    // Taipei 2026/10/06 (Tue)
    expect(chatRoomTimeLabel("2026-10-06T02:00:00.000Z", now, "zh-TW")).toEqual({
      kind: "weekday",
      value: "週二",
    });
  });

  it("shows M/d for older messages", () => {
    expect(chatRoomTimeLabel("2026-08-12T02:00:00.000Z", now, "zh-TW")).toEqual({
      kind: "date",
      value: "8/12",
    });
  });
});

describe("chatShortDate", () => {
  it("formats the Taipei date as M/d for the pinned-message panel", () => {
    expect(chatShortDate("2026-08-12T02:00:00.000Z")).toBe("8/12");
    expect(chatShortDate("2026-08-11T16:30:00.000Z")).toBe("8/12");
    expect(chatShortDate("bad")).toBe("");
  });
});

describe("chatRoomPreview", () => {
  const base = { id: 1, kind: "text", createdAt: "2026-10-11T01:00:00.000Z" };

  it("prefixes the author name for others' messages", () => {
    expect(
      chatRoomPreview({
        ...base,
        bodyPreview: "帶著那個問題來就好",
        authorName: "小海",
        isMine: false,
      })
    ).toEqual({ kind: "other", name: "小海", body: "帶著那個問題來就好" });
  });

  it("marks the viewer's own message", () => {
    expect(
      chatRoomPreview({ ...base, bodyPreview: "這個我懂", authorName: "小許", isMine: true })
    ).toEqual({ kind: "mine", body: "這個我懂" });
  });

  it("shows the bare body for system messages or deleted authors", () => {
    expect(
      chatRoomPreview({
        ...base,
        kind: "system",
        bodyPreview: "阿福 加入了",
        authorName: null,
        isMine: false,
      })
    ).toEqual({ kind: "plain", body: "阿福 加入了" });
  });

  it("is empty when the room has no messages", () => {
    expect(chatRoomPreview(null)).toEqual({ kind: "none" });
  });
});
