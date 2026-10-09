import { describe, expect, it } from "vitest";
import {
  selectChatDelta,
  selectChatErrorMessage,
  selectChatHistory,
  selectChatMembers,
  selectChatPins,
  selectChatRoom,
  selectChatRoomList,
  selectChatSearch,
} from "../services/chat";

// daodao#154 regression：server 的聊天 API 一律回 { success, data, ... } 外層。
// 以下 fixture 照 server-dev 2026-10-10 的實際回應形狀（room 9372）縮寫而成。

const timestamp = "2026-10-10T02:00:00.000Z";

const room = {
  id: 9372,
  cohortId: 37,
  name: "QA 272 dev 冒煙",
  iconLabel: "Q",
  colorSeed: 9372,
  organizationName: "lighthouse test",
  memberCount: 3,
  unreadCount: 2,
  lastMessage: null,
  lastActivityAt: "2026-10-09T17:49:44.079Z",
};

const message = {
  id: 4,
  roomId: 9372,
  kind: "text" as const,
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

const pagination = {
  cursors: { start: "4", end: null },
  hasMore: false,
  count: 1,
  limit: 50,
  hasNext: false,
  hasPrev: false,
  nextCursor: null,
  prevCursor: null,
  totalEstimate: null,
  parentTotalEstimate: null,
};

describe("chat response selectors (wire envelope)", () => {
  it("room list: reads items and totalUnread inside data", () => {
    const res = { success: true as const, data: { totalUnread: 3, items: [room] }, timestamp };
    expect(selectChatRoomList(res)).toEqual({ totalUnread: 3, items: [room] });
  });

  it("room list: empty when not loaded", () => {
    expect(selectChatRoomList(undefined)).toEqual({ totalUnread: 0, items: [] });
  });

  it("room detail: returns the room inside data", () => {
    const detail = { ...room, viewerRole: "host" as const, pinnedCount: 0, memberPreview: [] };
    const res = { success: true as const, data: detail, timestamp };
    expect(selectChatRoom(res)?.name).toBe("QA 272 dev 冒煙");
    expect(selectChatRoom(res)?.viewerRole).toBe("host");
    expect(selectChatRoom(undefined)).toBeUndefined();
  });

  it("members: returns the array inside data", () => {
    const member = {
      userId: 2,
      nickname: "小許",
      avatar: null,
      isHost: true,
      isOnline: false,
      bio: null,
    };
    const res = { success: true as const, data: [member], timestamp };
    expect(selectChatMembers(res)).toEqual([member]);
    expect(selectChatMembers(undefined)).toEqual([]);
  });

  it("history: returns the paginated message array inside data", () => {
    const res = { success: true as const, data: [message], pagination, timestamp };
    expect(selectChatHistory(res)).toEqual([message]);
    expect(selectChatHistory(undefined)).toEqual([]);
  });

  it("history: returns oldest → newest even though the server pages newest first", () => {
    // server listPage 回 id 由大到小；頁面拿最後一筆當 delta 的 after，必須是最新那筆
    const older = { ...message, id: 4 };
    const newer = { ...message, id: 5, body: "第二則" };
    const res = { success: true as const, data: [newer, older], pagination, timestamp };
    expect(selectChatHistory(res).map((m) => m.id)).toEqual([4, 5]);
  });

  it("history: ignores a delta-shaped body", () => {
    const res = {
      success: true as const,
      data: {
        messages: [message],
        changed: [],
        deletedIds: [],
        pinnedCount: 0,
        memberCount: 3,
        serverTime: timestamp,
      },
      timestamp,
    };
    expect(selectChatHistory(res)).toEqual([]);
  });

  it("delta: returns messages / changed / deletedIds inside data", () => {
    const edited = { ...message, body: "已編輯", editedAt: timestamp };
    const res = {
      success: true as const,
      data: {
        messages: [message],
        changed: [edited],
        deletedIds: [3],
        pinnedCount: 1,
        memberCount: 3,
        serverTime: timestamp,
      },
      timestamp,
    };
    expect(selectChatDelta(res)).toEqual({
      messages: [message],
      changed: [edited],
      deletedIds: [3],
    });
    expect(selectChatDelta(undefined)).toBeNull();
  });

  it("delta: ignores a history-shaped body", () => {
    const res = { success: true as const, data: [message], pagination, timestamp };
    expect(selectChatDelta(res)).toBeNull();
  });

  it("pins: returns the array inside data", () => {
    const pinned = { ...message, isPinned: true, pinnedAt: timestamp };
    const res = { success: true as const, data: [pinned], timestamp };
    expect(selectChatPins(res)).toEqual([pinned]);
    expect(selectChatPins(undefined)).toEqual([]);
  });

  it("search: reads total and items inside data", () => {
    const res = {
      success: true as const,
      data: { total: 1, items: [{ id: 4, createdAt: message.createdAt }] },
      timestamp,
    };
    expect(selectChatSearch(res)).toEqual({
      total: 1,
      items: [{ id: 4, createdAt: message.createdAt }],
    });
    expect(selectChatSearch(undefined)).toEqual({ total: 0, items: [] });
  });

  it("error: reads message inside the { success: false, error } envelope", () => {
    const err = {
      success: false,
      error: {
        type: "bad_request",
        message: "驗證失敗",
        details: [{ path: "body", message: "Too big" }],
      },
      timestamp,
    };
    expect(selectChatErrorMessage(err, "發送失敗")).toBe("驗證失敗");
  });

  it("error: falls back when the body has no usable message", () => {
    expect(selectChatErrorMessage(undefined, "發送失敗")).toBe("發送失敗");
    expect(selectChatErrorMessage({ success: false, error: { message: "" } }, "發送失敗")).toBe(
      "發送失敗"
    );
    expect(selectChatErrorMessage("boom", "發送失敗")).toBe("發送失敗");
  });
});
