import { requirePracticeFixture } from "./env";
import { expect, test } from "./fixtures";
import { deliveryDate, FOOTPRINTS_PATH, privacySentinel } from "./helpers";

test("practice title snapshot survives removal of the live practice relation", async ({
  page,
  ownerApi,
  database,
  e2eEnv,
  advanceLetterToDelivery,
}) => {
  const practice = requirePracticeFixture(e2eEnv);
  const draft = await ownerApi.createDraft({
    message: privacySentinel("practice-snapshot"),
    practiceId: practice.id,
  });
  await ownerApi.send(draft.id, deliveryDate());

  await database.query(
    "UPDATE future_letters SET practice_id = NULL WHERE external_id::text = $1 AND user_id = $2",
    [draft.id, e2eEnv.ownerUserId]
  );
  await advanceLetterToDelivery(draft.id);
  await ownerApi.open(draft.id);

  await page.goto(`${FOOTPRINTS_PATH}?futureLetterId=${draft.id}`);
  await expect(page.getByTestId("letter-detail-card")).toContainText(practice.title);
});
