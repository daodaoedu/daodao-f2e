import { afterEach, describe, expect, it, vi } from "vitest";
import { submitResponse } from "../survey";

describe("submitResponse", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits to the public survey external id instead of the database id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { response_id: 9 } }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await submitResponse({
      externalId: "feedback-share-id",
      answers: [{ questionId: "3", value: 8 }],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/surveys/public/feedback-share-id/responses",
      expect.objectContaining({ method: "POST" })
    );
  });
});
