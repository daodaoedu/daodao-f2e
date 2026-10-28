import { randomUUID } from "node:crypto";
import { cleanup, expect, test } from "./fixtures";

test("practice creation validates empty input and appears in personal space", async ({
  page,
  learnerToken,
  request,
}) => {
  const name = `jp-${randomUUID().slice(0, 8)}`;
  let id: string | undefined;
  try {
    await page.goto("/zh-TW/practices/create/manual");
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    await expect(page.getByText("請寫下你想實踐的行動", { exact: true })).toBeVisible();
    await page.getByPlaceholder("例如：圖書館借閱《原子習慣》，每天閱讀 30 頁").fill(name);
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    await page.locator('label[for="wizard-days-7"]').click();
    await expect(page.getByRole("radio", { name: "7天", exact: true })).toBeChecked();
    await page.locator('label[for="wizard-frequency-2-4"]').click();
    await expect(page.getByRole("radio", { name: "2-4 天", exact: true })).toBeChecked();
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    // This wizard exposes URL resources, not file uploads.
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    const created = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/api/v1/practices"
    );
    await page.getByRole("button", { name: "完成新增", exact: true }).click();
    const response = await created;
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    id = body.data.id;
    expect(id).toBeTruthy();
    await page.goto("/zh-TW/spaces/personal");
    await page.getByRole("tab", { name: "全部", exact: true }).click();
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await page.reload();
    await page.getByRole("tab", { name: "全部", exact: true }).click();
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  } finally {
    if (id) await cleanup(request, learnerToken, `/api/v1/practices/${id}`);
  }
});
