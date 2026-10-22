import { beforeEach, describe, expect, it, vi } from "vitest";

const mockWrapFetch = vi.fn();
vi.mock("../client", () => ({
  getApiBaseUrl: () => "https://server-dev.daodao.so",
  unauthorizedHandler: { wrapFetch: (...args: unknown[]) => mockWrapFetch(...args) },
}));

import { getFollowers, getFollowing } from "../services/follow";

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const pagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 2,
  itemsPerPage: 100,
  hasNext: false,
  hasPrev: false,
};

// server-dev 實際回應（2026-10-22，GET /api/v1/users/:id/followers）
const followersPayload = {
  success: true,
  data: [
    {
      userId: 900002,
      externalId: "00000000-0323-4000-8000-000000900002",
      nickname: "驗收・教練",
      followedAt: "2026-10-22T14:14:33.638Z",
    },
    {
      userId: 900004,
      externalId: "00000000-0323-4000-8000-000000900004",
      nickname: null,
      followedAt: "2026-10-22T14:20:00.000Z",
    },
  ],
  pagination,
  timestamp: "2026-10-22T14:14:34.488Z",
};

// server-dev 實際回應（2026-10-22，GET /api/v1/users/:id/following）
const followingPayload = {
  success: true,
  data: [
    {
      targetType: "user",
      user: {
        id: "00000000-0323-4000-8000-000000900003",
        name: "驗收・學員",
        photoURL: null,
        bio: null,
        identifier: "acceptance-learner",
      },
    },
  ],
  pagination: { ...pagination, totalItems: 1 },
  timestamp: "2026-10-22T14:16:02.932Z",
};

describe("follow service — server contract (daodao#251)", () => {
  beforeEach(() => mockWrapFetch.mockReset());

  it("getFollowers maps server FollowItem (nickname/externalId) to profiles with a string name", async () => {
    mockWrapFetch.mockResolvedValue(jsonResponse(200, followersPayload));

    const result = await getFollowers({ userId: "u-1", limit: 100 });

    expect(mockWrapFetch.mock.calls[0]?.[0]).toBe(
      "https://server-dev.daodao.so/api/v1/users/u-1/followers?limit=100"
    );
    expect(result.data).toEqual([
      {
        id: "00000000-0323-4000-8000-000000900002",
        name: "驗收・教練",
        photoURL: null,
        bio: null,
        identifier: null,
        followedAt: "2026-10-22T14:14:33.638Z",
      },
      {
        id: "00000000-0323-4000-8000-000000900004",
        name: "",
        photoURL: null,
        bio: null,
        identifier: null,
        followedAt: "2026-10-22T14:20:00.000Z",
      },
    ]);
    // 消費端會對 name 做 slice（social-hub 頭像首字），不可為 undefined
    for (const user of result.data) expect(typeof user.name).toBe("string");
  });

  it("getFollowers keeps the server pagination envelope", async () => {
    mockWrapFetch.mockResolvedValue(jsonResponse(200, followersPayload));

    const result = await getFollowers({ userId: "u-1" });

    expect(result.pagination).toEqual(pagination);
  });

  it("getFollowing passes through user items and pagination as the server sends them", async () => {
    mockWrapFetch.mockResolvedValue(jsonResponse(200, followingPayload));

    const result = await getFollowing({ userId: "u-1", page: 2, limit: 5 });

    expect(mockWrapFetch.mock.calls[0]?.[0]).toBe(
      "https://server-dev.daodao.so/api/v1/users/u-1/following?page=2&limit=5"
    );
    expect(result.data).toEqual(followingPayload.data);
    expect(result.pagination).toEqual({ ...pagination, totalItems: 1 });
  });

  it("getFollowers tolerates a response without data", async () => {
    mockWrapFetch.mockResolvedValue(jsonResponse(200, { success: true, pagination }));

    const result = await getFollowers({ userId: "u-1" });

    expect(result.data).toEqual([]);
  });

  it("getFollowers throws on non-ok responses", async () => {
    mockWrapFetch.mockResolvedValue(jsonResponse(500, { success: false }));

    await expect(getFollowers({ userId: "u-1" })).rejects.toThrow("載入關注者失敗");
  });
});
