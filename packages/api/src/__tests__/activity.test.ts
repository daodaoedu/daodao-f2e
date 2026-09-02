import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGET = vi.fn();
vi.mock("../client", () => ({ client: { GET: (...args: unknown[]) => mockGET(...args) } }));

import { getActivities } from "../services/activity";

describe("activity service", () => {
  beforeEach(() => mockGET.mockReset());

  it("getActivities 呼叫公開列表端點", async () => {
    mockGET.mockResolvedValue({ data: { success: true, data: [] } });
    await getActivities();
    expect(mockGET).toHaveBeenCalledWith("/api/v1/activities");
  });
});
