import { beforeEach, describe, expect, it, vi } from "vitest";
import { lighthouseMessageListResponseSchema, sendLighthouseMessage } from "../services/cohort";

const { post } = vi.hoisted(() => ({ post: vi.fn().mockResolvedValue({ data: {} }) }));
vi.mock("../client", () => ({ client: { POST: post } }));

describe("Lighthouse comment target contract", () => {
  beforeEach(() => post.mockClear());

  it("preserves the selected check-in without adding a legacy category", async () => {
    await sendLighthouseMessage(1, 2, 3, { practiceId: 4, checkinId: 5, body: "Demo reply" });
    expect(post).toHaveBeenCalledWith(
      "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/participants/{userId}/messages",
      {
        params: { path: { programId: 1, cohortId: 2, userId: 3 } },
        body: { practiceId: 4, checkinId: 5, body: "Demo reply" },
      }
    );
  });

  it("leaves the target at practice level when no check-in is selected", async () => {
    await sendLighthouseMessage(1, 2, 3, { practiceId: 4, body: "Demo practice comment" });
    expect(post).toHaveBeenCalledWith(
      "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/participants/{userId}/messages",
      {
        params: { path: { programId: 1, cohortId: 2, userId: 3 } },
        body: { practiceId: 4, body: "Demo practice comment" },
      }
    );
  });

  it("retains source and check-in association across history entries", () => {
    const entry = {
      id: 10,
      cohortId: 2,
      recipientUserId: 3,
      senderUserId: 6,
      senderNickname: "Demo coach",
      practiceId: 4,
      practiceTitle: "Demo practice",
      templateId: null,
      body: "Demo reply",
      sentAt: "2026-11-22T00:00:00.000Z",
    };
    const result = lighthouseMessageListResponseSchema.parse({
      success: true,
      timestamp: "2026-11-22T00:00:00.000Z",
      data: {
        participant: { userId: 3, nickname: "Demo learner", avatar: null },
        total: 3,
        items: [
          { ...entry, source: "lighthouse", checkinId: 5 },
          { ...entry, id: 11, source: "checkin", checkinId: 5, sentAt: null },
          { ...entry, id: 12, source: "practice", checkinId: null },
        ],
      },
    });
    expect(result.data.items.map(({ source, checkinId }) => ({ source, checkinId }))).toEqual([
      { source: "lighthouse", checkinId: 5 },
      { source: "checkin", checkinId: 5 },
      { source: "practice", checkinId: null },
    ]);
  });
});
