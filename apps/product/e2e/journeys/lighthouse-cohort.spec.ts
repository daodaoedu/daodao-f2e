import { randomUUID } from "node:crypto";
import { addDays, format } from "date-fns";
import { fixtureProgram } from "./contracts";
import { api, cleanup, expect, login, manifest, serviceUrl, test, urls } from "./fixtures";

test("staff creates Lighthouse cohort; learner consent gates joining and cohort remains visible", async ({
  browser,
  page,
  learnerToken: _token,
  request,
}) => {
  const context = await browser.newContext({
    viewport: page.viewportSize(),
    locale: "zh-TW",
    timezoneId: "Asia/Taipei",
  });
  const token = await login(context, "owner");
  const staff = await context.newPage();
  const program = fixtureProgram(manifest, "lighthouse");
  const name = `journey-lighthouse-${randomUUID().slice(0, 8)}`;
  const endpoint = `/api/v1/lighthouse/programs/${program.id}/cohorts`;
  let id: number | undefined;
  try {
    await staff.goto(serviceUrl(urls.product, "/zh-TW/lighthouse/programs"));
    await expect(
      staff.getByRole("heading", { name: program.name, exact: true }),
      "staff membership must resolve before creating a cohort"
    ).toBeVisible();
    const panel = staff
      .locator("article")
      .filter({ has: staff.getByText(program.name, { exact: true }) });
    await panel.getByRole("button", { name: "建立場次", exact: true }).click();
    const form = panel.locator("form").filter({ has: staff.locator('input[name="slug"]') });
    await form.getByRole("button", { name: "建立場次", exact: true }).click();
    await expect(form.locator('input[name="displayName"]:invalid')).toBeVisible();
    await form.locator('input[name="displayName"]').fill(name);
    await form.locator('input[name="slug"]').fill(name);
    await form.locator('input[name="startDate"]').fill(format(new Date(), "yyyy-MM-dd"));
    await form.locator('input[name="endDate"]').fill(format(addDays(new Date(), 14), "yyyy-MM-dd"));
    await form.getByText("選擇互動方式", { exact: true }).click();
    await staff.getByText("線上非同步", { exact: true }).click();
    await form.getByRole("button", { name: "線上非同步", exact: true }).click();
    await form
      .locator("span")
      .filter({ hasText: "建立後立即發佈並產生邀請連結" })
      .getByRole("switch")
      .check();
    const created = staff.waitForResponse(
      (entry) => entry.request().method() === "POST" && new URL(entry.url()).pathname === endpoint
    );
    await form.getByRole("button", { name: "建立場次", exact: true }).click();
    const response = await created;
    expect(response.ok()).toBeTruthy();
    const cohort = (await response.json()).data;
    id = cohort.id;
    expect(cohort.joinToken).toBeTruthy();
    await page.goto(`/zh-TW/cohorts/join/${cohort.joinToken}`);
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "同意並加入", exact: true })).toBeDisabled();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "同意並加入", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/cohorts/${id}$`));
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  } finally {
    if (id) await cleanup(request, token, `${endpoint}/${id}`);
    await context.close();
  }
});

for (const state of ["upcoming", "active", "full", "closed", "closed-paused"] as const) {
  test(`cohort joining boundary: ${state}`, async ({
    browser,
    page,
    learnerToken: _token,
    request,
  }) => {
    const staffContext = await browser.newContext({
      viewport: page.viewportSize(),
      locale: "zh-TW",
      timezoneId: "Asia/Taipei",
    });
    const token = await login(staffContext, "owner");
    const program = fixtureProgram(manifest, "lighthouse");
    const endpoint = `/api/v1/lighthouse/programs/${program.id}/cohorts`;
    const name = `journey-${state}-${randomUUID().slice(0, 8)}`;
    const closed = state.startsWith("closed");
    const date = (offset: number) => format(addDays(new Date(), offset), "yyyy-MM-dd");
    let id: number | undefined;
    try {
      const cohort = await api(request, token, "POST", endpoint, {
        slug: name,
        displayName: name,
        startDate: date(state === "upcoming" ? 7 : -7),
        endDate: date(21),
        joinDeadline: date(closed ? -1 : 14),
        capacity: state === "full" ? 1 : null,
        status: "published",
        interactionModes: ["async"],
      });
      id = cohort.id;
      if (state === "full") {
        const coachToken = await login(staffContext, "coach");
        await api(request, coachToken, "POST", `/api/v1/cohorts/join/${cohort.joinToken}`, {
          consent: true,
        });
      }
      if (state === "closed-paused") await cleanup(request, token, `${endpoint}/${id}/join-token`);
      await page.goto(`/zh-TW/cohorts/join/${cohort.joinToken}`);
      if (state === "upcoming" || state === "active") {
        await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "同意並加入", exact: true })).toBeDisabled();
        await page.getByRole("checkbox").check();
        await expect(page.getByRole("button", { name: "同意並加入", exact: true })).toBeEnabled();
      } else {
        await expect(
          page.getByRole("heading", {
            name: state === "full" ? "本期人數已滿" : "本期已超過加入截止日",
            exact: true,
          })
        ).toBeVisible();
        await expect(page.getByRole("button", { name: "同意並加入", exact: true })).toHaveCount(0);
        if (state === "closed-paused") await expect(page.getByText(/暫停/).first()).toBeVisible();
      }
    } finally {
      if (id) await cleanup(request, token, `${endpoint}/${id}`);
      await staffContext.close();
    }
  });
}
