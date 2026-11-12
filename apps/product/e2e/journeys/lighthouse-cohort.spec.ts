import { randomUUID } from "node:crypto";
import { fixtureProgram, journeyClosedDeadline, journeyDate } from "./contracts";
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
    await form.locator('input[name="startDate"]').fill(journeyDate());
    await form.locator('input[name="endDate"]').fill(journeyDate(14));
    await form.getByText("選擇互動方式", { exact: true }).click();
    await staff.getByText("線上非同步", { exact: true }).click();
    await form.getByRole("button", { name: "線上非同步", exact: true }).click();
    const created = staff.waitForResponse(
      (entry) => entry.request().method() === "POST" && new URL(entry.url()).pathname === endpoint
    );
    await form.getByRole("button", { name: "建立場次", exact: true }).click();
    const response = await created;
    expect(response.ok()).toBeTruthy();
    const cohort = (await response.json()).data;
    id = cohort.id;
    expect(cohort.status, "#521：建立場次一律為草稿，發佈改由場次卡操作").toBe("draft");
    expect(cohort.joinToken).toBeTruthy();
    // TEMP 診斷（#521 CI）：CI 不上傳截圖，失敗時把面板狀態寫進錯誤訊息
    await staff.waitForTimeout(3000);
    const diag = JSON.stringify({
      cards: await panel.locator("[id^=cohort-]").count(),
      newCard: await staff.locator(`#cohort-${id}`).count(),
      forms: await panel.locator("form").count(),
      headings: await panel.locator("h4").allTextContents(),
      text: (await panel.innerText()).replace(/\s+/g, " ").slice(0, 600),
    });
    const listRes = await request.fetch(serviceUrl(urls.api, endpoint), {
      headers: { Authorization: `Bearer ${token}`, cookie: `auth_token=${token}` },
    });
    const listBody = await listRes.text();
    let listInfo = "";
    try {
      const rows = (JSON.parse(listBody).data ?? []) as { id: number }[];
      const mine = rows.find((row) => row.id === id);
      listInfo = JSON.stringify({
        status: listRes.status(),
        count: rows.length,
        ids: rows.map((r) => r.id),
        mine,
      });
    } catch {
      listInfo = `status=${listRes.status()} body=${listBody.slice(0, 300)}`;
    }
    expect(
      await staff.locator(`#cohort-${id}`).count(),
      `diag ${diag} list ${listInfo.slice(0, 3000)}`
    ).toBe(1);
    // #521 AC-03：建立後留在管理頁並開啟場次設定，以文字提示接續設定
    await expect(
      panel.getByText("基本資料已建立，請完成其他設定", { exact: true }),
      "post-create setup reminder"
    ).toBeVisible();
    const card = staff.locator(`#cohort-${id}`);
    await card.getByRole("button", { name: "發佈", exact: true }).click();
    const published = staff.waitForResponse(
      (entry) =>
        entry.request().method() === "PATCH" &&
        new URL(entry.url()).pathname === `${endpoint}/${id}`
    );
    await staff
      .getByRole("dialog")
      .or(staff.getByRole("alertdialog"))
      .first()
      .getByRole("button", { name: "發佈", exact: true })
      .click();
    expect((await published).ok(), "publish from cohort card").toBeTruthy();
    await page.goto(`/zh-TW/cohorts/join/${cohort.joinToken}`);
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "同意並加入", exact: true })).toBeDisabled();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "同意並加入", exact: true }).click();
    // 私有程式庫的 CI runner 只有 2 核心（公開的是 4 核心），加入後跳轉常超過預設 20 秒；只放寬這一步。
    await expect(page).toHaveURL(new RegExp(`/cohorts/${id}$`), { timeout: 60_000 });
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
    const now = new Date();
    const date = (offset: number) => journeyDate(offset, now);
    let id: number | undefined;
    try {
      const cohort = await api(request, token, "POST", endpoint, {
        slug: name,
        displayName: name,
        startDate: date(state === "upcoming" ? 7 : -7),
        endDate: date(21),
        joinDeadline: closed ? journeyClosedDeadline(now) : date(14),
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
