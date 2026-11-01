import { describe, expect, it } from "vitest";
import type { INotificationApiItem } from "../hooks/useNotifications";
import { getNotificationHref, getNotificationText } from "../utils/notification-display";

const messages: Record<string, string> = {
  text_cohort_invitation: "{name} 邀請你加入場次「{title}」",
  text_cohort_removed: "你已被移出場次「{title}」",
  text_cohort_invitation_fallback: "你收到一則場次邀請，相關場次資訊已無法取得",
  text_cohort_removed_fallback: "你已被移出一個場次，相關場次資訊已無法取得",
  text_follow_user: "{name} 開始關注你",
  text_default: "{name} 發出了一則通知",
  text_wish_linked: "你的願望已連結到路線圖項目「{title}」",
  text_roadmap_shipped: "你支持的路線圖項目「{title}」已上線",
  related_roadmap_item: "相關項目",
};
const t = (key: string, values?: Record<string, string | number>) =>
  (messages[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(values?.[name] ?? ""));
const item = (
  overrides: Partial<INotificationApiItem> & Record<string, unknown> = {}
): INotificationApiItem => ({
  id: 1,
  type: "CohortInvitation",
  priority: "P1",
  isRead: false,
  aggregationCount: 1,
  createdAt: "2026-11-01T00:00:00Z",
  actor: { id: "teacher", name: "小島" },
  entityType: "cohort",
  entityId: "10",
  ...overrides,
});

describe("mobile cohort notification display", () => {
  it("identifies invitations with their cohort name", () => {
    expect(getNotificationText(item({ cohortName: "英文學習" }), t)).toBe(
      "小島 邀請你加入場次「英文學習」"
    );
  });
  it("identifies member removals without suggesting an inaccessible cohort link", () => {
    const removed = item({
      type: "CohortMemberRemoved",
      cohortName: "英文學習",
      url: "https://app.daodao.so/cohorts/join/token",
    });
    expect(getNotificationText(removed, t)).toBe("你已被移出場次「英文學習」");
    expect(getNotificationHref(removed)).toBeNull();
  });
  it("uses historical messages when cohort metadata is absent", () => {
    expect(getNotificationText(item({ message: "小島邀請你加入英文學習場次" }), t)).toBe(
      "小島邀請你加入英文學習場次"
    );
  });
  it("uses event-specific fallback when historical metadata is gone", () => {
    expect(getNotificationText(item(), t)).toBe(messages.text_cohort_invitation_fallback);
    expect(getNotificationText(item({ type: "CohortMemberRemoved" }), t)).toBe(
      messages.text_cohort_removed_fallback
    );
  });
  it("opens an invitation's actual web destination on either app environment", () => {
    for (const host of ["app.daodao.so", "app-dev.daodao.so"]) {
      const url = `https://${host}/cohorts/join/abc-123`;
      expect(getNotificationHref(item({ url }))).toBe(url);
    }
  });
  it.each([
    "javascript:alert(1)",
    "http://app.daodao.so/cohorts/join/token",
    "https://app.daodao.so.evil.test/cohorts/join/token",
    "https://evil.test/cohorts/join/token",
    "https://user:pass@app.daodao.so/cohorts/join/token",
    "https://app.daodao.so/users/other",
    "//app.daodao.so/cohorts/join/token",
    "https://app.daodao.so/cohorts/join/",
    "https://app.daodao.so/cohorts/join/token?next=https://evil.test",
    "https://app.daodao.so/cohorts/join/token#redirect",
  ])("does not navigate to untrusted or unrelated invitation URL %s", (url) => {
    expect(getNotificationHref(item({ url }))).toBeNull();
  });
  it("shows explicit messages from other event types", () => {
    expect(
      getNotificationText(item({ type: "CohortJoined", message: "  小島已加入英文學習場次  " }), t)
    ).toBe("小島已加入英文學習場次");
  });
  it("keeps the generic fallback for unknown events without meaningful messages", () => {
    expect(getNotificationText(item({ type: "UnknownEvent", message: "   " }), t)).toBe(
      "小島 發出了一則通知"
    );
    expect(getNotificationText(item({ type: "UnknownEvent" }), t)).toBe("小島 發出了一則通知");
  });
  it("retains existing notification text and navigation", () => {
    const followed = item({ type: "UserFollowed", entityType: "user" });
    expect(getNotificationText(followed, t)).toBe("小島 開始關注你");
    expect(getNotificationHref(followed)).toBe("/users/teacher");
    expect(
      getNotificationHref(
        item({ type: "Comment", entityType: "practice", entityId: "practice-1", checkinId: 20 })
      )
    ).toBe("/practices/practice-1/check-ins/20");
  });
});

describe("mobile roadmap notifications", () => {
  it.each([
    ["WishLinked", "你的願望已連結到路線圖項目「打卡提醒」"],
    ["RoadmapShipped", "你支持的路線圖項目「打卡提醒」已上線"],
  ])("identifies %s with its item title", (type, expected) => {
    expect(getNotificationText(item({ type, entityTitle: " 打卡提醒 " }), t)).toBe(expected);
  });
  it.each([
    ["WishLinked", "你的願望已連結到路線圖項目「相關項目」"],
    ["RoadmapShipped", "你支持的路線圖項目「相關項目」已上線"],
  ])("identifies %s without historical title metadata", (type, expected) => {
    expect(getNotificationText(item({ type, entityTitle: " " }), t)).toBe(expected);
    expect(getNotificationText(item({ type }), t)).toBe(expected);
  });
  it.each(["WishLinked", "RoadmapShipped"])("opens %s on the web product roadmap", (type) => {
    for (const host of ["app.daodao.so", "app-dev.daodao.so"]) {
      const url = `https://${host}/roadmap`;
      expect(getNotificationHref(item({ type, entityType: "roadmap_item", url }))).toBe(url);
    }
  });
  it.each([
    undefined,
    "https://evil.test/roadmap",
    "https://app.daodao.so.evil.test/roadmap",
    "https://app.daodao.so/cohorts/join/token",
    "https://app.daodao.so/roadmap?redirect=bad",
    "https://app.daodao.so/roadmap#bad",
    "javascript:alert(1)",
    "http://app.daodao.so/roadmap",
  ])("rejects missing or unrelated roadmap destination %s", (url) => {
    expect(getNotificationHref(item({ type: "WishLinked", url }))).toBeNull();
    expect(getNotificationHref(item({ type: "RoadmapShipped", url }))).toBeNull();
  });
});
