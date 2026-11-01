import { describe, expect, it } from "vitest";
import type { NotificationApiItem } from "@/hooks/use-notifications";
import { apiItemToDisplay } from "../notification-display";
import { buildNotificationDeepLink as buildDeepLink } from "../notification-link";

const item: NotificationApiItem = {
  id: 1,
  type: "CohortInvitation",
  priority: "P1",
  isRead: false,
  aggregationCount: 1,
  createdAt: "2026-11-01T00:00:00Z",
  actor: { id: "coach", name: "教練" },
  entityType: "cohort",
  entityId: "12",
  cohortName: "秋季班",
  message: "邀請你加入秋季班",
  url: "https://app-dev.daodao.so/cohorts/join/invite-token",
};
describe("notification display data and destinations", () => {
  it("maps invitation data without losing cohort context", () => {
    expect(apiItemToDisplay(item, "zh-TW")).toMatchObject({
      type: "cohort-invitation",
      cohortName: "秋季班",
      message: "邀請你加入秋季班",
    });
  });
  it("maps removal", () => {
    expect(apiItemToDisplay({ ...item, type: "CohortMemberRemoved" }, "en").type).toBe(
      "cohort-member-removed"
    );
  });
  it("opens an invitation's join page", () => {
    expect(buildDeepLink(item)).toBe("/cohorts/join/invite-token");
  });
  it("does not direct removed recipients back into the inaccessible cohort", () => {
    expect(buildDeepLink({ ...item, type: "CohortMemberRemoved" })).toBeNull();
  });
  it.each([
    undefined,
    "https://evil.example/cohorts/join/x",
    "//evil.example/cohorts/join/x",
    "javascript:alert(1)",
    "/cohorts/12",
    "/cohorts/join/x?redirect=https://evil.example",
    "https://app-dev.daodao.so/cohorts/join/x#bad",
  ])("rejects unavailable or unrelated invitation URL %s", (url) => {
    expect(buildDeepLink({ ...item, url })).toBeNull();
  });
  it.each(["WishLinked", "RoadmapShipped"])("opens the existing roadmap for %s", (type) => {
    expect(
      buildDeepLink({
        ...item,
        type,
        entityType: "roadmap_item",
        url: "https://app-dev.daodao.so/roadmap",
      })
    ).toBe("/roadmap");
    expect(buildDeepLink({ ...item, type, url: "https://evil.example/roadmap" })).toBeNull();
  });
  it.each(["en", "zh-TW"])("leaves locale prefixing to the navigation router (%s)", (locale) => {
    expect(
      buildDeepLink({
        ...item,
        url: `https://app-dev.daodao.so/${locale}/cohorts/join/invite-token`,
      })
    ).toBe("/cohorts/join/invite-token");
    expect(
      buildDeepLink({
        ...item,
        type: "WishLinked",
        url: `https://app-dev.daodao.so/${locale}/roadmap`,
      })
    ).toBe("/roadmap");
  });
  it("retains existing practice navigation", () => {
    expect(
      buildDeepLink({
        ...item,
        type: "Comment",
        entityType: "practice",
        entityId: "practice-id",
        checkinId: 7,
      })
    ).toBe("/practices/practice-id/check-ins/7");
  });
});
