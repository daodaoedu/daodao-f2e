import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGET = vi.fn();
vi.mock("../client", () => ({ client: { GET: (...args: unknown[]) => mockGET(...args) } }));

import { getActivities, getActivity } from "../services/activity";

describe("activity service", () => {
  beforeEach(() => mockGET.mockReset());

  it("getActivities 呼叫公開列表端點", async () => {
    mockGET.mockResolvedValue({ data: { success: true, data: [] } });
    await getActivities();
    expect(mockGET).toHaveBeenCalledWith("/api/v1/activities");
  });

  it("getActivity 以 cohortId 呼叫詳情端點", async () => {
    mockGET.mockResolvedValue({ data: { success: true, data: { id: 7 } } });
    await getActivity(7);
    expect(mockGET).toHaveBeenCalledWith("/api/v1/activities/{cohortId}", {
      params: { path: { cohortId: 7 } },
    });
  });
});
