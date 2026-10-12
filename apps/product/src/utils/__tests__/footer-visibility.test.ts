import { describe, expect, it } from "vitest";
import { isFooterHidden } from "../footer-visibility";

// daodao#154 POC 對齊：聊天頁（/messages、/messages/[roomId]）不渲染全站 Footer，
// 否則桌機版整頁會多出 60px 可往下捲；其他頁面維持原樣。
describe("isFooterHidden", () => {
  it("hides the footer on the chat list and chat room pages", () => {
    expect(isFooterHidden("/messages")).toBe(true);
    expect(isFooterHidden("/messages/9372")).toBe(true);
    expect(isFooterHidden("/messages/")).toBe(true);
  });

  it("keeps the footer everywhere else", () => {
    expect(isFooterHidden("/")).toBe(false);
    expect(isFooterHidden("/spaces")).toBe(false);
    expect(isFooterHidden("/messages-archive")).toBe(false);
    expect(isFooterHidden("/settings/messages")).toBe(false);
  });
});
