import { expect, test } from "@playwright/test";

// Exercise the real auth provider, API hooks, SWR cache and activity pages.
// Only the HTTP boundary is synthetic; these tests never join a real cohort.
test("activity membership follows the current viewer after another tab changes accounts", async ({
  page,
  context,
}) => {
  let viewer = "member";
  let releaseDetail: (() => void) | undefined;
  let holdDetail = false;
  let failDetail = false;
  const requests: string[] = [];
  const activity = () => ({
    id: 150,
    displayName: "活動會員快取回歸",
    programName: "微小實驗",
    description: "活動詳情",
    tagline: null,
    runStatus: "upcoming",
    isJoined: viewer === "member",
    canJoin: true,
    unavailableReason: null,
    joinToken: "viewer-cache-fixture",
    signupMethod: "island_form",
    externalSignupUrl: null,
    startDate: "2026-11-14",
    endDate: "2026-11-28",
    timezone: "Asia/Taipei",
    interactionModes: ["sync"],
    location: "會員聚會地點",
    feeType: "free",
    feeAmount: null,
    participantCount: 1,
    capacity: null,
    templateCount: 2,
    host: { userId: 10, identifier: "host", name: "發起人", avatar: null },
    organization: { name: "組織", bio: "組織介紹", externalLink: null },
    sessions: [{ id: 1, sessionDate: "2026-11-14", startTime: "14:00", endTime: "15:00" }],
  });
  await context.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path === "/api/v1/auth/me") {
      data = {
        user: {
          id: viewer,
          name: viewer,
          email: null,
          email_verified: true,
          roles: [],
          permissions: [],
        },
        isTemporary: false,
      };
    } else if (path === "/api/v1/activities/150") {
      requests.push(`detail:${viewer}`);
      if (failDetail) {
        await route.fulfill({
          status: 503,
          json: { error: { code: "SERVICE_UNAVAILABLE", message: "Fixture unavailable" } },
        });
        return;
      }
      data = activity();
      if (holdDetail) {
        await new Promise<void>((resolve) => {
          releaseDetail = resolve;
        });
      }
    } else if (path === "/api/v1/activities") {
      requests.push(`list:${viewer}`);
      data = [activity()];
    }
    await route.fulfill({ json: { success: true, data } });
  });

  // A second page changes shared storage, as the real OAuth/account flow does.
  const otherTab = await context.newPage();
  await otherTab.goto("/activities/150");
  await expect(otherTab.getByRole("link", { name: "已加入", exact: true })).toBeVisible();
  await page.goto("/activities/150");
  await expect(page.getByRole("link", { name: "已加入", exact: true })).toHaveAttribute(
    "href",
    "/cohorts/150"
  );
  await expect(page.getByText("會員聚會地點", { exact: true })).toBeVisible();

  viewer = "non-member";
  holdDetail = true;
  await otherTab.evaluate(() => {
    localStorage.setItem(
      "_userinfo",
      JSON.stringify({ id: "non-member", name: "非會員", roles: [], permissions: [] })
    );
  });
  await expect.poll(() => requests.includes("detail:non-member")).toBe(true);
  // A new cache key alone is insufficient: global keepPreviousData is true.
  await expect(page.getByRole("link", { name: "已加入", exact: true })).toHaveCount(0);
  await expect(page.getByText("會員聚會地點", { exact: true })).toHaveCount(0);
  holdDetail = false;
  releaseDetail?.();
  await expect(page.getByRole("link", { name: "報名加入", exact: true })).toHaveAttribute(
    "href",
    "/cohorts/join/viewer-cache-fixture"
  );
  await expect(page.getByText("加入後即可查看", { exact: true })).toBeVisible();
  await expect(page.getByText("會員聚會地點", { exact: true })).toHaveCount(0);
  expect(requests).toContain("detail:non-member");

  await page.goto("/activities");
  const card = page.getByRole("link").filter({ hasText: "活動會員快取回歸" });
  await expect(card).toHaveAttribute("href", "/activities/150");
  const before = requests.filter((request) => request === "list:member").length;
  viewer = "member";
  await otherTab.evaluate(() => {
    localStorage.setItem(
      "_userinfo",
      JSON.stringify({ id: "member", name: "會員", roles: [], permissions: [] })
    );
  });
  await expect
    .poll(() => requests.filter((request) => request === "list:member").length)
    .toBeGreaterThan(before);
  await expect(card).toHaveAttribute("href", "/activities/150");
  await card.click();
  await expect(page).toHaveURL(/\/activities\/150$/);
  await expect(page.getByRole("link", { name: "已加入", exact: true })).toBeVisible();

  // Logging out also updates the already mounted detail, without a reload.
  viewer = "guest";
  await otherTab.evaluate(() => localStorage.removeItem("_userinfo"));
  await expect(page.getByRole("link", { name: "報名加入", exact: true })).toBeVisible();
  await expect(page.getByText("會員聚會地點", { exact: true })).toHaveCount(0);
  expect(requests).toContain("detail:guest");

  failDetail = true;
  viewer = "unavailable-viewer";
  await otherTab.evaluate(() => {
    localStorage.setItem(
      "_userinfo",
      JSON.stringify({ id: "unavailable-viewer", roles: [], permissions: [] })
    );
  });
  await expect(page.getByText("找不到此活動", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "已加入", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "報名加入", exact: true })).toHaveCount(0);
  await expect(page.getByText("會員聚會地點", { exact: true })).toHaveCount(0);
});

for (const path of ["/activities", "/activities/150"]) {
  test(`an unavailable session check never loads personalized activities as a guest: ${path}`, async ({
    page,
    context,
  }) => {
    let authUnavailable = true;
    let authRequests = 0;
    let activityRequests = 0;
    await context.route("**/api/v1/**", async (route) => {
      const apiPath = new URL(route.request().url()).pathname;
      if (apiPath === "/api/v1/auth/me") {
        authRequests += 1;
        if (authUnavailable) {
          await route.fulfill({ status: 503, json: { error: { code: "SERVICE_UNAVAILABLE" } } });
        } else {
          await route.fulfill({
            json: {
              success: true,
              data: {
                user: { id: "member", email_verified: true, roles: [], permissions: [] },
                isTemporary: false,
              },
            },
          });
        }
        return;
      }
      if (apiPath.startsWith("/api/v1/activities")) activityRequests += 1;
      await route.fulfill({
        json: { success: true, data: apiPath === "/api/v1/activities" ? [] : null },
      });
    });
    await page.goto(path);
    await expect.poll(() => authRequests).toBe(1);
    await expect(page.getByRole("status", { name: "Loading", exact: true })).toHaveCount(0);
    expect(activityRequests).toBe(0);
    await expect(page.getByText("暫時無法確認登入狀態", { exact: true })).toBeVisible();
    authUnavailable = false;
    await page.getByRole("button", { name: "重試", exact: true }).click();
    await expect.poll(() => activityRequests).toBe(1);
    expect(authRequests).toBe(2);
    await expect(page.getByText("暫時無法確認登入狀態", { exact: true })).toHaveCount(0);
  });
}

test("activity requests wait until the initial session has been checked", async ({
  page,
  context,
}) => {
  let authStarted = false;
  let activityRequests = 0;
  let releaseAuth: (() => void) | undefined;
  await context.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/v1/auth/me") {
      authStarted = true;
      await new Promise<void>((resolve) => {
        releaseAuth = resolve;
      });
      await route.fulfill({
        json: {
          success: true,
          data: {
            user: { id: "viewer", email_verified: true, roles: [], permissions: [] },
            isTemporary: false,
          },
        },
      });
    } else {
      if (path === "/api/v1/activities/150") activityRequests += 1;
      await route.fulfill({ status: 503, json: { error: { code: "SERVICE_UNAVAILABLE" } } });
    }
  });
  await page.goto("/activities/150");
  await expect.poll(() => authStarted).toBe(true);
  await expect(page.getByRole("status", { name: "Loading", exact: true })).toBeVisible();
  expect(activityRequests).toBe(0);
  releaseAuth?.();
  await expect(page.getByText("找不到此活動", { exact: true })).toBeVisible();
  expect(activityRequests).toBe(1);
});
