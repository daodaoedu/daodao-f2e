import { describe, expect, it } from "vitest";
import { decideChatScroll, isNearBottom } from "../chat-scroll";

const base = {
  prevCount: 0,
  nextCount: 10,
  firstUnreadMessageId: null,
  firstUnreadLoaded: false,
  anchored: false,
  lastIsOwn: false,
};

describe("decideChatScroll（daodao#555 從第一則未讀開始看）", () => {
  it("有未讀時，進入聊天室停在第一則未讀", () => {
    expect(decideChatScroll({ ...base, firstUnreadMessageId: 42, firstUnreadLoaded: true })).toBe(
      "first-unread"
    );
  });

  it("沒有未讀時，進入聊天室捲到最新訊息", () => {
    expect(decideChatScroll(base)).toBe("bottom");
  });

  it("第一則未讀不在時間軸上時，退回捲到最新訊息", () => {
    expect(decideChatScroll({ ...base, firstUnreadMessageId: 42 })).toBe("bottom");
  });

  it("停在未讀時，輪詢補進的他人訊息不把畫面拉到底", () => {
    expect(decideChatScroll({ ...base, prevCount: 10, nextCount: 15, anchored: true })).toBe(
      "none"
    );
  });

  it("停在未讀時，自己送出訊息會捲到底", () => {
    expect(
      decideChatScroll({ ...base, prevCount: 10, nextCount: 11, anchored: true, lastIsOwn: true })
    ).toBe("bottom");
  });

  it("已回到底部後，新訊息照常捲到底", () => {
    expect(decideChatScroll({ ...base, prevCount: 10, nextCount: 11 })).toBe("bottom");
  });

  it("訊息數沒變（例如編輯、按讚）不捲動", () => {
    expect(decideChatScroll({ ...base, prevCount: 10, nextCount: 10 })).toBe("none");
  });

  it("空聊天室不捲動", () => {
    expect(decideChatScroll({ ...base, nextCount: 0 })).toBe("none");
  });
});

describe("isNearBottom", () => {
  it("距底部 80px 內算回到底部，超過不算", () => {
    expect(isNearBottom({ scrollHeight: 1000, scrollTop: 520, clientHeight: 400 })).toBe(true);
    expect(isNearBottom({ scrollHeight: 1000, scrollTop: 500, clientHeight: 400 })).toBe(false);
  });
});
