import { expect, test } from "@playwright/test";

// Exercise the real pages and click handler; only the API boundary is synthetic.
// Run against a local product app, using the repo's Playwright config/baseURL.
test.use({ locale: "zh-TW" });

for (const locale of ["zh-TW", "en"] as const) {
  for (const readState of ["pending", "failed", "already-read"] as const) {
    test(`${locale}: feedback notification opens its report when read is ${readState}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      let releaseRead: (() => void) | undefined;
      const readGate = new Promise<void>((resolve) => {
        releaseRead = resolve;
      });
      let readRequests = 0;
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));

      await page.route("**/api/v1/**", async (route) => {
        const request = route.request();
        const pathname = new URL(request.url()).pathname;
        const headers = {
          "access-control-allow-origin": request.headers().origin ?? "*",
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET,PATCH,OPTIONS",
          "access-control-allow-headers": "content-type,authorization",
        };
        const respond = (data: unknown) =>
          route.fulfill({ status: 200, headers, json: { success: true, data } });
        if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
        if (pathname === "/api/v1/auth/me") {
          return respond({
            isTemporary: false,
            user: {
              id: "notification-test-user",
              name: "QA451",
              email: "qa451@example.test",
              email_verified: true,
              roles: ["User"],
              permissions: [],
            },
          });
        }
        if (pathname === "/api/v1/notifications/9/read") {
          readRequests += 1;
          if (readState === "pending") await readGate;
          if (readState === "failed") return route.abort("failed");
          return respond({});
        }
        if (pathname === "/api/v1/notifications") {
          return respond({
            notifications: [
              {
                id: 9,
                type: "FeedbackReplied",
                priority: "P1",
                isRead: readState === "already-read",
                aggregationCount: 1,
                createdAt: "2026-11-22T03:00:00Z",
                actor: { id: "team", name: "島島團隊" },
                entityType: "feedback",
                entityId: "8",
                entityTitle: "QA451 導頁回歸",
              },
            ],
            unreadCount: readState === "already-read" ? 0 : 1,
            hasMore: false,
            nextCursor: null,
          });
        }
        if (pathname === "/api/v1/feedback/mine") {
          return respond({
            items: [
              {
                id: 8,
                content: "QA451 導頁回歸",
                area: "ui",
                link: `https://example.test/${"long-report-link/".repeat(12)}`,
                screenshots: [],
                status: "replied",
                createdAt: "2026-11-22T03:00:00Z",
                replies: [{ id: 1, content: "團隊回覆內容", createdAt: "2026-11-22T04:00:00Z" }],
              },
            ],
          });
        }
        return respond({ items: [], notifications: [], unreadCount: 0 });
      });

      try {
        const prefix = locale === "en" ? "/en" : "";
        await page.goto(`${prefix}/notifications`);
        await page.getByText("QA451 導頁回歸", { exact: false }).last().click();
        // Navigation must complete while the read request is still unresolved.
        await expect
          .poll(() => new URL(page.url()).pathname)
          .toBe(`${prefix}/settings/bug-report/mine`);
        expect(new URL(page.url()).searchParams.get("report")).toBe("8");
        await expect(page.getByText("團隊回覆內容")).toBeVisible();
        await expect(page.locator("#bug-report-8")).toBeVisible();
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
          .toBe(true);
        expect(await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))).toEqual({
          width: 390,
          height: 844,
        });
        expect(readRequests).toBe(readState === "already-read" ? 0 : 1);
        expect(errors).toEqual([]);
      } finally {
        releaseRead?.();
      }
    });
  }
}
