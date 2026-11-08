import { describe, expect, it } from "vitest";
import type { NotificationApiItem } from "@/hooks/use-notifications";
import { apiItemToDisplay } from "../notification-display";
import { buildNotificationDeepLink } from "../notification-link";

// daodao#451 AC-07：團隊回覆錯誤回報的站內通知，點下去進「我的回報」並捲到該則
const item: NotificationApiItem = {
  id: 9,
  type: "FeedbackReplied",
  priority: "P1",
  isRead: false,
  aggregationCount: 1,
  createdAt: "2026-11-08T03:00:00Z",
  actor: { id: "admin-uuid", name: "島島小幫手" },
  entityType: "feedback",
  entityId: "8",
  entityTitle: "按下送出後畫面沒有反應",
};

describe("FeedbackReplied notification", () => {
  it("顯示為團隊回覆錯誤回報，帶出回報摘要", () => {
    expect(apiItemToDisplay(item, "zh-TW")).toMatchObject({
      type: "feedback-replied",
      entityTitle: "按下送出後畫面沒有反應",
      hasDestination: true,
    });
  });

  it("點擊進我的回報並指到該則回報", () => {
    expect(buildNotificationDeepLink(item)).toBe("/settings/bug-report/mine?report=8");
  });

  it("entityId 不是數字時仍進我的回報，不把任意字串拼進網址", () => {
    expect(buildNotificationDeepLink({ ...item, entityId: "../../evil" })).toBe(
      "/settings/bug-report/mine"
    );
  });
});
