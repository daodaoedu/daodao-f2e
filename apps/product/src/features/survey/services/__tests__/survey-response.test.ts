import { afterEach, describe, expect, it, vi } from "vitest";
import { submitResponse } from "../survey";

describe("submitResponse", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits to the public survey external id instead of the database id", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { response_id: 9 } }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    );
    // Observe the HTTP contract independently of URL/Request and body-buffer transport choices.
    vi.stubGlobal(
      "fetch",
      async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const request = new Request(
          typeof input === "string" ? new URL(input, "http://localhost") : input,
          init
        );
        return fetchMock(new URL(request.url).pathname, {
          method: request.method,
          body: await request.text(),
        });
      }
    );

    await submitResponse({
      externalId: "feedback-share-id",
      answers: [{ questionId: "3", value: 8 }],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/surveys/public/feedback-share-id/responses",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error("Expected a survey submission request");
    expect(await new Response(call[1]?.body).json()).toEqual({
      answers: [{ question_id: 3, rating_value: 8 }],
    });
  });
});
