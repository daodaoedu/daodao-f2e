import { describe, expect, it } from "vitest";
import type { NotificationApiItem } from "@/hooks/use-notifications";
import { buildNotificationDeepLink, getUserProfilePath } from "../notification-link";

const USER_UUID = "3f6b2c1e-8a4d-4f2b-9c7e-1d2a3b4c5d6e";

function makeItem(overrides: Partial<NotificationApiItem> = {}): NotificationApiItem {
  return {
    id: 1,
    type: "UserFollowed",
    priority: "P2",
    isRead: false,
    aggregationCount: 1,
    createdAt: "2026-10-22T00:00:00Z",
    actor: { id: USER_UUID, name: "小島", customId: "island_kid" },
    entityType: "user",
    entityId: USER_UUID,
    ...overrides,
  };
}

describe("buildNotificationDeepLink — 使用者頁連結（daodao#22）", () => {
  it("關注通知：actor 有 customId 時連到 /users/<customId>", () => {
    expect(buildNotificationDeepLink(makeItem())).toBe("/users/island_kid");
  });

  it("連結通知：actor 有 customId 時連到 /users/<customId>", () => {
    expect(buildNotificationDeepLink(makeItem({ type: "Connect", entityType: "connection" }))).toBe(
      "/users/island_kid"
    );
  });

  it("actor 沒有 customId（null）時 fallback 到 /users/<id>", () => {
    const item = makeItem({ actor: { id: USER_UUID, name: "小島", customId: null } });
    expect(buildNotificationDeepLink(item)).toBe(`/users/${USER_UUID}`);
  });

  it("actor customId 為空字串時 fallback 到 /users/<id>", () => {
    const item = makeItem({ actor: { id: USER_UUID, name: "小島", customId: "" } });
    expect(buildNotificationDeepLink(item)).toBe(`/users/${USER_UUID}`);
  });

  it("actor 沒有 id 也沒有 customId 時不導向", () => {
    const item = makeItem({ actor: { id: "", name: "有人", customId: null } });
    expect(buildNotificationDeepLink(item)).toBeNull();
  });
});

describe("buildNotificationDeepLink — 非使用者類通知不受影響", () => {
  it("打卡通知連到打卡頁", () => {
    const item = makeItem({ type: "Comment", entityType: "comment", entityId: "p1", checkinId: 9 });
    expect(buildNotificationDeepLink(item)).toBe("/practices/p1/check-ins/9");
  });

  it("實踐通知連到實踐頁", () => {
    const item = makeItem({ type: "PracticeFollowed", entityType: "practice", entityId: "p1" });
    expect(buildNotificationDeepLink(item)).toBe("/practices/p1");
  });
});

describe("getUserProfilePath", () => {
  it("優先 customId，否則 id，兩者都沒有回 null", () => {
    expect(getUserProfilePath({ id: USER_UUID, customId: "island_kid" })).toBe("/users/island_kid");
    expect(getUserProfilePath({ id: USER_UUID, customId: undefined })).toBe(`/users/${USER_UUID}`);
    expect(getUserProfilePath({ id: undefined, customId: null })).toBeNull();
  });
});
