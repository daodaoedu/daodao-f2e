import { expect, test } from "@playwright/test";

for (const joinDeadline of ["2026-11-20T00:00:00.000Z", null]) {
  test(`join deadline uses the activity calendar-date format (${joinDeadline ?? "end date fallback"})`, async ({
    page,
    context,
  }) => {
    await context.route("**/api/v1/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() !== "GET")
        throw new Error("This fixture must never join or write account data");
      let data: unknown = [];
      if (path === "/api/v1/auth/me") {
        data = {
          user: { id: "date-reader", email_verified: true, roles: [], permissions: [] },
          isTemporary: false,
        };
      } else if (path === "/api/v1/cohorts/join/date-fixture") {
        data = {
          cohortId: 150,
          displayName: "日期格式回歸",
          timezone: "Asia/Taipei",
          startDate: "2026-11-14T00:00:00.000Z",
          endDate: "2026-11-28T00:00:00.000Z",
          tagline: null,
          interactionModes: ["sync"],
          location: null,
          sessions: [],
          feeType: "free",
          feeAmount: null,
          signupMethod: "island_form",
          externalSignupUrl: null,
          capacity: null,
          joinDeadline,
          participantCount: 0,
          inviteMessage: "第一段\n\n第二段",
          canJoin: false,
          unavailableReason: "expired",
          unavailableReasons: ["expired"],
          privacy: {
            isPrivate: true,
            checkinDefaultPrivate: true,
            hostCommentDefaultPrivate: true,
          },
          visibilityNotice: "本期內可見",
          organization: { name: "日期測試", bio: null, externalLink: null },
        };
      }
      await route.fulfill({ json: { success: true, data, timestamp: "2026-11-22T00:00:00.000Z" } });
    });
    await page.goto("/cohorts/join/date-fixture");
    await expect(
      page.getByText(joinDeadline ? "2026/11/20" : "2026/11/28", { exact: false })
    ).toBeVisible();
  });
}
