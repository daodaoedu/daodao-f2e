import { beforeEach, describe, expect, it, vi } from "vitest";

// daodao-server checkInQuerySchema.limit 上限（src/validators/practice.validators.ts）
const SERVER_MAX_LIMIT = 100;

type CheckIn = { id: number; mood?: string; note?: string; createdAt: string };

const mockGet = vi.fn();
vi.mock("../client", () => ({
  client: { GET: (...args: unknown[]) => mockGet(...args) },
}));

import { getPracticeSummary } from "../services/practice";

const PRACTICE_ID = "practice-uuid";

const makeCheckIns = (count: number): CheckIn[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    // 前 100 筆全是 good；第 101 筆之後全是 happy → happy 只在第 2 頁
    mood: i < 100 ? "good" : "happy",
    note: `note-${i + 1}`,
    createdAt: new Date(Date.UTC(2026, 0, 1) + i * 3_600_000).toISOString(),
  }));

/** 模擬 server：limit > 100 回 400，否則依 page/limit 切片並附 pagination */
const setupServer = (checkInCount: number, checkIns: CheckIn[]) => {
  mockGet.mockImplementation(
    async (path: string, options?: { params?: { query?: { page?: number; limit?: number } } }) => {
      if (path === "/api/v1/practices/{id}") {
        return {
          data: {
            success: true,
            data: {
              id: PRACTICE_ID,
              title: "每日閱讀",
              practiceAction: "讀 10 頁",
              startDate: "2026-01-01",
              endDate: "2026-06-30",
              checkInCount,
              user: { name: "小島" },
            },
          },
        };
      }
      if (path === "/api/v1/checkin-encouragements/random") {
        return { data: { success: true, data: { message: "加油" } } };
      }
      if (path === "/api/v1/practices/{id}/checkins") {
        const page = options?.params?.query?.page ?? 1;
        const limit = options?.params?.query?.limit ?? 20;
        if (limit > SERVER_MAX_LIMIT) {
          return {
            error: { success: false, error: { message: "Too big: expected number to be <=100" } },
            response: new Response(null, { status: 400 }),
          };
        }
        const totalPages = Math.max(1, Math.ceil(checkIns.length / limit));
        return {
          data: {
            success: true,
            data: checkIns.slice((page - 1) * limit, page * limit),
            pagination: {
              currentPage: page,
              totalPages,
              totalItems: checkIns.length,
              itemsPerPage: limit,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            },
          },
        };
      }
      throw new Error(`unexpected path ${path}`);
    }
  );
};

const checkInRequests = () =>
  mockGet.mock.calls
    .filter(([path]) => path === "/api/v1/practices/{id}/checkins")
    .map(
      ([, options]) =>
        (options as { params: { query: { page?: number; limit?: number } } }).params.query
    );

describe("getPracticeSummary — checkins 請求不超過 server 上限（daodao#297）", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("checkInCount = 0 時不送 limit > 100", async () => {
    setupServer(0, []);

    const result = await getPracticeSummary(PRACTICE_ID);

    expect(result.error).toBeNull();
    for (const query of checkInRequests()) {
      expect(query.limit).toBeLessThanOrEqual(SERVER_MAX_LIMIT);
    }
    expect(result.data?.topMoods).toEqual([]);
    expect(result.data?.topNotes).toEqual([]);
  });

  it("checkInCount > 100 時分頁取完，過程心情與筆記摘錄納入第 2 頁之後的打卡", async () => {
    const checkIns = makeCheckIns(250);
    // 最長筆記放在第 3 頁
    checkIns[230] = {
      ...(checkIns[230] as CheckIn),
      note: "這是第三頁才有、最長的一則打卡筆記內容",
    };
    setupServer(checkIns.length, checkIns);

    const result = await getPracticeSummary(PRACTICE_ID);

    expect(result.error).toBeNull();
    const queries = checkInRequests();
    expect(queries.length).toBeGreaterThan(1);
    for (const query of queries) {
      expect(query.limit).toBeLessThanOrEqual(SERVER_MAX_LIMIT);
    }
    // happy 150 次（第 2、3 頁）> good 100 次（第 1 頁）
    expect(result.data?.topMoods.map((m) => [m.mood, m.count])).toEqual([
      ["happy", 150],
      ["good", 100],
    ]);
    expect(result.data?.topNotes[0]).toBe("這是第三頁才有、最長的一則打卡筆記內容");
    expect(result.data?.checkInCount).toBe(250);
  });

  it("1–100 筆維持一次請求", async () => {
    setupServer(22, makeCheckIns(22));

    const result = await getPracticeSummary(PRACTICE_ID);

    expect(checkInRequests()).toHaveLength(1);
    expect(result.data?.topMoods.map((m) => [m.mood, m.count])).toEqual([["good", 22]]);
  });
});
