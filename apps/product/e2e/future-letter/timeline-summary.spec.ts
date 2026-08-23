import { expect, test } from "./fixtures";
import { deliveryDate, FOOTPRINTS_PATH, HOME_PATH, nodeY, privacySentinel } from "./helpers";

test("full timeline and homepage summary share ordered date coordinates and state", async ({
  page,
  ownerApi,
  database,
  e2eEnv,
  advanceLetterToDelivery,
}) => {
  const openedDraft = await ownerApi.createDraft({ message: privacySentinel("timeline-opened") });
  await ownerApi.send(openedDraft.id, deliveryDate());
  await advanceLetterToDelivery(openedDraft.id);
  await ownerApi.open(openedDraft.id);
  await database.query(
    "UPDATE future_letters SET deliver_at = NOW() - INTERVAL '1 day' WHERE external_id::text = $1 AND user_id = $2",
    [openedDraft.id, e2eEnv.ownerUserId]
  );

  const scheduledDraft = await ownerApi.createDraft({
    message: privacySentinel("timeline-scheduled"),
  });
  await ownerApi.send(scheduledDraft.id, deliveryDate(7));

  await page.goto(FOOTPRINTS_PATH);
  const timeline = page.getByTestId("future-letter-timeline");
  const opened = timeline.locator('[data-testid="timeline-node"][data-kind="opened"]');
  const today = timeline.locator('[data-testid="timeline-node"][data-kind="today"]');
  const scheduled = timeline.locator('[data-testid="timeline-node"][data-kind="scheduled"]');
  await expect(opened).toBeVisible();
  await expect(today).toBeVisible();
  await expect(scheduled).toBeVisible();
  // The full footprints timeline stacks vertically: pending future letters at the
  // top, "today" in the middle, past/delivered events below.
  expect(await nodeY(scheduled)).toBeLessThan(await nodeY(today));
  expect(await nodeY(today)).toBeLessThan(await nodeY(opened));

  const scheduledDate = await scheduled.getAttribute("data-date");
  expect(scheduledDate).toBeTruthy();
  await page.goto(HOME_PATH);
  const summary = page.getByTestId("home-timeline-summary");
  await expect(summary.getByRole("button", { name: "寫信給未來的自己" })).toHaveCount(0);
  const summaryScheduled = summary.locator(
    `[data-testid="timeline-node"][data-kind="scheduled"][data-date="${scheduledDate}"]`
  );
  await expect(summaryScheduled).toBeVisible();
  await summaryScheduled.click();
  await expect(page).toHaveURL(new RegExp(`/me/footprints\\?[^#]*focusDate=${scheduledDate}`));
});
