import { expect, test } from "./fixtures";
import { deliveryDate, FOOTPRINTS_PATH, privacySentinel } from "./helpers";

test.describe("Future Letter FRD lifecycle", () => {
  test("delivery stays redacted until idempotent first open and remains opened after reload", async ({
    page,
    ownerApi,
    advanceLetterToDelivery,
    assertNoDeliveryNotification,
  }) => {
    const message = privacySentinel("opened-message");
    const draft = await ownerApi.createDraft({ message });
    await ownerApi.send(draft.id, deliveryDate());
    await advanceLetterToDelivery(draft.id);
    await assertNoDeliveryNotification(draft.id);

    const delivered = await ownerApi.get(draft.id);
    expect(delivered.letter?.status).toBe("delivered");
    expect(delivered.letter?.openedAt).toBeNull();
    expect(delivered.letter?.message ?? "").not.toContain(message);

    await page.goto(FOOTPRINTS_PATH);
    const unopened = page.locator(
      `[data-testid="timeline-node"][data-node-id="letter-${draft.id}"][data-kind="delivered-unopened"]`
    );
    await expect(unopened).toBeVisible();

    const openResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/v1/me/future-letters/${draft.id}/open`) &&
        response.request().method() === "POST" &&
        response.ok()
    );
    await unopened.focus();
    await unopened.press("Enter");
    await openResponsePromise;
    await expect(page.getByTestId("letter-detail-card")).toContainText(message);

    const firstOpenedAt = (await ownerApi.get(draft.id)).letter?.openedAt;
    expect(firstOpenedAt).toBeTruthy();
    await ownerApi.open(draft.id);
    expect((await ownerApi.get(draft.id)).letter?.openedAt).toBe(firstOpenedAt);

    const readCard = page.locator(
      `[data-testid="timeline-node"][data-node-id="letter-${draft.id}"]`
    );
    await page.keyboard.press("Escape");
    await expect(readCard).toBeFocused();
    await readCard.press("Enter");
    await expect(page.getByTestId("letter-detail-card")).toContainText(message);
    await page.keyboard.press("Tab");
    const close = page.getByRole("button", { name: "關閉信件", exact: true });
    await expect(close).toBeFocused();
    await close.press("Enter");
    await expect(readCard).toBeFocused();

    await page.reload();
    await expect(page.locator('[data-testid="timeline-node"][data-kind="opened"]')).toBeVisible();
  });

  test("scheduled deletion defaults focus to cancel and removes the delayed job", async ({
    page,
    ownerApi,
    getDeliveryJobId,
    assertDeliveryJobMissing,
  }) => {
    const draft = await ownerApi.createDraft({ message: privacySentinel("delete-scheduled") });
    await ownerApi.send(draft.id, deliveryDate());
    const deliveryJobId = await getDeliveryJobId(draft.id);
    await page.goto(FOOTPRINTS_PATH);

    await page.locator(`[data-testid="timeline-node"][data-node-id="letter-${draft.id}"]`).click();
    await page.getByRole("button", { name: "信件操作" }).click();
    const cancel = page.getByRole("button", { name: "取消", exact: true });
    await expect(cancel).toBeFocused();
    await cancel.click();
    expect((await ownerApi.get(draft.id)).response.status()).toBe(200);

    await page.getByRole("button", { name: "信件操作" }).click();
    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/v1/me/future-letters/${draft.id}`) &&
        response.request().method() === "DELETE" &&
        response.ok()
    );
    await page.getByRole("button", { name: "永久刪除" }).click();
    await deleteResponsePromise;
    await assertDeliveryJobMissing(deliveryJobId);
    expect((await ownerApi.get(draft.id)).response.status()).toBe(404);
  });
});
