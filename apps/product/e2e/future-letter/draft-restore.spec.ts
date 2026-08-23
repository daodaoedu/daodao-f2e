import { expect, test } from "./fixtures";
import { FOOTPRINTS_PATH, privacySentinel } from "./helpers";

test.describe("Future Letter FRD draft", () => {
  test("closing auto-saves one draft and the CTA restores it", async ({ page, ownerApi }) => {
    const currentSelf = privacySentinel("draft-current");
    const message = privacySentinel("draft-message");

    expect(
      (await ownerApi.list()).filter((letter) => letter.status === "draft"),
      "E2E_USER_A_ID must be a disposable account with no pre-existing drafts"
    ).toEqual([]);
    await page.goto(FOOTPRINTS_PATH);
    await page.getByRole("button", { name: "寫信給未來的自己" }).first().click();
    await page.locator("#current-self").fill(currentSelf);
    await page.locator("#message-to-future").fill(message);

    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/me/future-letters") &&
        response.request().method() === "POST" &&
        response.ok()
    );
    await page.keyboard.press("Escape");
    const saveResponse = await saveResponsePromise;
    const saveBody = (await saveResponse.json()) as {
      data?: { id?: string; data?: { id?: string } };
    };
    const createdDraftId = saveBody.data?.data?.id ?? saveBody.data?.id;
    if (!createdDraftId) throw new Error("Draft POST response did not include the created ID");
    ownerApi.track(createdDraftId);

    const drafts = (await ownerApi.list()).filter((letter) => letter.status === "draft");
    expect(drafts).toHaveLength(1);
    const draft = drafts[0];
    if (!draft) throw new Error("Expected the auto-saved draft to be returned by the API");
    expect(draft.id).toBe(createdDraftId);

    await page.getByRole("button", { name: "寫信給未來的自己" }).first().click();
    await expect(page.locator("#current-self")).toHaveValue(currentSelf);
    await expect(page.locator("#message-to-future")).toHaveValue(message);

    await page.locator("#message-to-future").fill(`${message}-updated`);
    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/v1/me/future-letters/${draft.id}`) &&
        response.request().method() === "PATCH" &&
        response.ok()
    );
    await page.keyboard.press("Escape");
    await updateResponsePromise;
    expect((await ownerApi.list()).filter((letter) => letter.status === "draft")).toHaveLength(1);
  });

  test("closing an all-whitespace form creates no draft", async ({ page, ownerApi }) => {
    expect(
      (await ownerApi.list()).filter((letter) => letter.status === "draft"),
      "E2E_USER_A_ID must be a disposable account with no pre-existing drafts"
    ).toEqual([]);

    await page.goto(FOOTPRINTS_PATH);
    await page.getByRole("button", { name: "寫信給未來的自己" }).first().click();
    await page.locator("#current-self").fill(" \n ");
    await page.locator("#message-to-future").fill("   ");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    expect((await ownerApi.list()).filter((letter) => letter.status === "draft")).toHaveLength(0);
  });

  test("clearing an existing draft deletes the stale server copy", async ({ page, ownerApi }) => {
    expect(
      (await ownerApi.list()).filter((letter) => letter.status === "draft"),
      "E2E_USER_A_ID must be a disposable account with no pre-existing drafts"
    ).toEqual([]);
    const draft = await ownerApi.createDraft({
      currentSelf: privacySentinel("clear-current"),
      message: privacySentinel("clear-message"),
    });

    await page.goto(FOOTPRINTS_PATH);
    await page.getByRole("button", { name: "寫信給未來的自己" }).first().click();
    await page.locator("#current-self").fill("  ");
    await page.locator("#message-to-future").fill("\n");
    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/v1/me/future-letters/${draft.id}`) &&
        response.request().method() === "DELETE" &&
        response.ok()
    );
    await page.keyboard.press("Escape");
    await deleteResponsePromise;

    expect((await ownerApi.list()).filter((letter) => letter.status === "draft")).toHaveLength(0);
  });

  test("write CTA stays disabled until the existing draft query settles", async ({ page }) => {
    let releaseDraftQuery: (() => void) | undefined;
    const draftQueryGate = new Promise<void>((resolve) => {
      releaseDraftQuery = resolve;
    });
    await page.route("**/api/v1/me/future-letters?status=draft**", async (route) => {
      await draftQueryGate;
      await route.continue();
    });

    await page.goto(FOOTPRINTS_PATH);
    const writeButton = page.getByRole("button", { name: "寫信給未來的自己" }).first();
    await expect(writeButton).toBeDisabled();
    releaseDraftQuery?.();
    await expect(writeButton).toBeEnabled();
  });

  test("cached draft revalidation keeps the write CTA disabled", async ({ page, ownerApi }) => {
    let draftQueryCount = 0;
    let releaseRevalidation: (() => void) | undefined;
    const revalidationGate = new Promise<void>((resolve) => {
      releaseRevalidation = resolve;
    });
    await page.route("**/api/v1/me/future-letters?status=draft**", async (route) => {
      draftQueryCount += 1;
      if (draftQueryCount > 1) await revalidationGate;
      await route.continue();
    });

    expect(
      (await ownerApi.list()).filter((letter) => letter.status === "draft"),
      "E2E_USER_A_ID must be a disposable account with no pre-existing drafts"
    ).toEqual([]);
    await page.goto(FOOTPRINTS_PATH);
    const writeButton = page.getByRole("button", { name: "寫信給未來的自己" }).first();
    await expect(writeButton).toBeEnabled();
    await writeButton.click();
    await page.locator("#message-to-future").fill(privacySentinel("cached-revalidation"));

    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/me/future-letters") &&
        response.request().method() === "POST" &&
        response.ok()
    );
    await page.keyboard.press("Escape");
    const saveResponse = await saveResponsePromise;
    const saveBody = (await saveResponse.json()) as {
      data?: { id?: string; data?: { id?: string } };
    };
    const createdDraftId = saveBody.data?.data?.id ?? saveBody.data?.id;
    if (!createdDraftId) throw new Error("Draft POST response did not include the created ID");
    ownerApi.track(createdDraftId);
    await expect(writeButton).toBeDisabled();
    releaseRevalidation?.();
    await expect(writeButton).toBeEnabled();
  });
});
