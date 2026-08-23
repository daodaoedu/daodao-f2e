import { expect, test } from "./fixtures";
import { deliveryDate, FOOTPRINTS_PATH, privacySentinel } from "./helpers";

test("scheduled plaintext is absent from owner UI, API responses, and cross-account access", async ({
  page,
  ownerApi,
  otherUserApi,
  networkEvidence,
}) => {
  const currentSelf = privacySentinel("scheduled-current");
  const message = privacySentinel("scheduled-message");
  const draft = await ownerApi.createDraft({ currentSelf, message });
  const scheduled = await ownerApi.send(draft.id, deliveryDate());

  expect(scheduled.status).toBe("scheduled");
  expect(scheduled.currentSelf ?? "").not.toContain(currentSelf);
  expect(scheduled.message ?? "").not.toContain(message);

  const listResponsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === "/api/v1/me/future-letters" && url.searchParams.has("limit")
    );
  });
  await page.goto(FOOTPRINTS_PATH);
  await listResponsePromise;
  await expect(page.getByTestId("future-letter-timeline")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(currentSelf);
  await expect(page.locator("body")).not.toContainText(message);

  const ownerListJson = JSON.stringify(await ownerApi.list());
  const ownerGet = await ownerApi.get(draft.id);
  await networkEvidence.settle();
  const capturedFutureLetterGets = networkEvidence.entries.filter(
    (entry) => entry.method === "GET" && entry.url.includes("/api/v1/me/future-letters")
  );
  expect(capturedFutureLetterGets.length).toBeGreaterThan(0);
  expect(capturedFutureLetterGets.map((entry) => entry.captureError ?? null)).toEqual(
    capturedFutureLetterGets.map(() => null)
  );
  expect(capturedFutureLetterGets.every((entry) => typeof entry.body === "string")).toBe(true);
  const capturedBodies = capturedFutureLetterGets.map((entry) => entry.body).join("\n");
  for (const secret of [currentSelf, message]) {
    expect(ownerListJson).not.toContain(secret);
    expect(JSON.stringify(ownerGet.letter)).not.toContain(secret);
    expect(capturedBodies).not.toContain(secret);
  }

  const crossAccount = await otherUserApi.get(draft.id);
  expect(crossAccount.response.status()).toBe(404);
  expect(await crossAccount.response.text()).not.toContain(currentSelf);
  expect(await crossAccount.response.text()).not.toContain(message);
});
