import { describe, expect, it } from "vitest";
import { decideChatScroll, isNearBottom, resolveUnreadAnchor } from "../chat-scroll";

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

describe("resolveUnreadAnchor", () => {
  it("第一則未讀已載入就停在它", () => {
    expect(resolveUnreadAnchor(42, [40, 41, 42, 43])).toBe(42);
  });

  it("未讀比載入的還多時，停在已載入最舊的一則", () => {
    expect(resolveUnreadAnchor(10, [200, 201, 202])).toBe(200);
  });

  it("沒有未讀或還沒有訊息時不停留", () => {
    expect(resolveUnreadAnchor(null, [1, 2])).toBeNull();
    expect(resolveUnreadAnchor(5, [])).toBeNull();
  });

  it("第一則未讀比最新還新（例如已被刪除）時不停留", () => {
    expect(resolveUnreadAnchor(300, [200, 201])).toBeNull();
  });
});
