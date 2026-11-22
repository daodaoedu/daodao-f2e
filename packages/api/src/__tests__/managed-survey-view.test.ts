import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@daodao/config", () => ({ getRequiredEnv: () => "https://survey-api.example" }));

import { recordManagedSurveyView } from "../services/cohort-feedback";

afterEach(() => vi.unstubAllGlobals());

describe("anonymous aggregate managed-survey views", () => {
  it("counts a view without credentials, authorization, referrer or session data", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    await recordManagedSurveyView("managed-529");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error("Expected an anonymous aggregate view request");
    const [url, init] = call;
    expect(url).toBe("https://survey-api.example/api/v1/surveys/public/managed-529/views");
    expect(init).toEqual({
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    expect(init?.body).toBeUndefined();
    expect(new Headers(init?.headers).has("Authorization")).toBe(false);
  });

  it("does not block filling when the aggregate counter is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")));
    await expect(recordManagedSurveyView("managed-529")).resolves.toBeUndefined();
  });
});
