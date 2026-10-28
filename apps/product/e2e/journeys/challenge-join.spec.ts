import { randomUUID } from "node:crypto";
import { addDays, format } from "date-fns";
import {
  api,
  cleanup,
  createChallengeFixtures,
  expect,
  login,
  serviceUrl,
  test,
  urls,
} from "./fixtures";

test("admin creates and publishes challenge; learner joins and sees the resulting practice", async ({
  browser,
  page,
  learnerToken,
  request,
}) => {
  const admin = await browser.newContext({
    viewport: page.viewportSize(),
    locale: "zh-TW",
    timezoneId: "Asia/Taipei",
  });
  const token = await login(admin, "owner");
  const staff = await admin.newPage();
  const name = `journey-challenge-${randomUUID().slice(0, 8)}`;
  const { program, template } = await createChallengeFixtures(request, token, name);
  const endpoint = `/api/v1/admin/challenges/programs/${program.id}/cohorts`;
  let id: number | undefined;
  let practiceId: string | undefined;
  try {
    await staff.goto(serviceUrl(urls.admin, "group-challenges"));
    await staff.getByText(program.name, { exact: true }).first().click();
    await staff.getByRole("button", { name: "新增一期", exact: true }).click();
    await staff.getByRole("button", { name: "建立草稿", exact: true }).click();
    await expect(staff.locator("#cohort-name:invalid")).toBeVisible();
    await staff.locator("#cohort-name").fill(name);
    await staff.locator("#cohort-template").click();
    await staff.getByRole("option").filter({ hasText: template.title }).click();
    await staff.locator("#cohort-start").fill(format(addDays(new Date(), 1), "yyyy-MM-dd"));
    await staff.locator("#cohort-deadline").fill(format(addDays(new Date(), 7), "yyyy-MM-dd"));
    const created = staff.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname.endsWith(endpoint)
    );
    await staff.getByRole("button", { name: "建立草稿", exact: true }).click();
    const response = await created;
    expect(response.ok()).toBeTruthy();
    id = (await response.json()).data.id;
    const row = staff.getByRole("row").filter({ hasText: name });
    staff.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "發佈", exact: true }).click();
    await expect(row.getByText("已發佈", { exact: true })).toBeVisible();
    await page.goto("/zh-TW/challenges");
    await page
      .locator("div.group\\/card")
      .filter({ hasText: name })
      .getByRole("button", { name: "現在加入", exact: true })
      .click();
    const joined = page.waitForResponse(
      (entry) =>
        entry.request().method() === "POST" &&
        new URL(entry.url()).pathname === `/api/v1/challenges/${id}/join`
    );
    await page.getByRole("button", { name: "加入這個挑戰", exact: true }).click();
    const joinResponse = await joined;
    expect(joinResponse.ok()).toBeTruthy();
    practiceId = (await joinResponse.json()).data.practiceId;
    await expect(page.getByText("你已加入共同挑戰", { exact: true })).toBeVisible();
    await page.goto(`/zh-TW/practices/${practiceId}`);
    await expect(page.getByText(template.title, { exact: true }).first()).toBeVisible();
  } finally {
    if (practiceId) await cleanup(request, learnerToken, `/api/v1/practices/${practiceId}`);
    if (id) await cleanup(request, token, `${endpoint}/${id}`);
    await cleanup(request, token, `/api/v1/admin/challenges/programs/${program.id}`);
    await admin.close();
  }
});

for (const state of ["upcoming", "active", "full", "closed"] as const) {
  test(`public challenge card state: ${state}`, async ({
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
    const ownerToken = await login(context, "owner");
    const name = `journey-card-${state}-${randomUUID().slice(0, 8)}`;
    const date = (offset: number) => format(addDays(new Date(), offset), "yyyy-MM-dd");
    const { program, template } = await createChallengeFixtures(request, ownerToken, name);
    const endpoint = `/api/v1/admin/challenges/programs/${program.id}/cohorts`;
    let deadlineOffset = 7;
    if (state === "closed") deadlineOffset = -1;
    if (state === "active") deadlineOffset = 1;
    let id: number | undefined;
    let copiedPractice: string | undefined;
    let coachToken: string | undefined;
    try {
      const cohort = await api(request, ownerToken, "POST", endpoint, {
        displayName: name,
        startDate: date(state === "active" ? -1 : 7),
        joinDeadline: date(deadlineOffset),
        capacity: state === "full" ? 1 : null,
        templateId: template.id,
      });
      id = cohort.id;
      await api(request, ownerToken, "POST", `${endpoint}/${id}/status`, { status: "published" });
      if (state === "full") {
        coachToken = await login(context, "coach");
        const joined = await api(request, coachToken, "POST", `/api/v1/challenges/${id}/join`);
        copiedPractice = joined.practiceId;
      }
      await page.goto("/zh-TW/challenges");
      const card = page.locator('div[class~="group/card"]').filter({ hasText: name });
      await expect(card.getByText(name, { exact: true })).toBeVisible();
      if (state === "upcoming" || state === "active") {
        await expect(
          card.getByText(state === "upcoming" ? "未開始" : "進行中", { exact: true })
        ).toBeVisible();
        if (state === "upcoming") {
          await expect(card.getByRole("button", { name: "現在加入", exact: true })).toBeEnabled();
        } else {
          // FR-EXP-04: ongoing unjoined challenges intentionally expose no joining CTA.
          await expect(card.getByRole("button", { name: "現在加入", exact: true })).toHaveCount(0);
        }
      } else {
        await expect(
          card.getByText(state === "full" ? "已額滿" : "報名截止", { exact: true })
        ).toBeVisible();
        await expect(card.getByRole("button", { name: "現在加入", exact: true })).toHaveCount(0);
      }
    } finally {
      if (copiedPractice && coachToken)
        await cleanup(request, coachToken, `/api/v1/practices/${copiedPractice}`);
      if (id) await cleanup(request, ownerToken, `${endpoint}/${id}`);
      await cleanup(request, ownerToken, `/api/v1/admin/challenges/programs/${program.id}`);
      await context.close();
    }
  });
}
