import { beforeEach, describe, expect, it, vi } from "vitest";

const useQuery = vi.fn();
vi.mock("../hooks", () => ({ useQuery: (...args: unknown[]) => useQuery(...args) }));

import { useMyChallenges } from "../services/challenge-hooks";

// daodao#295 review 2：未登入時 GET /me/challenges 必回 401，不應發出請求
describe("useMyChallenges", () => {
  beforeEach(() => {
    useQuery.mockReset();
  });

  it("預設（已登入）照常查詢", () => {
    useMyChallenges();
    expect(useQuery).toHaveBeenCalledWith(
      "/api/v1/me/challenges",
      {},
      { revalidateOnFocus: false }
    );
  });

  it("enabled=false 時傳 null init（swr-openapi 慣例：停用查詢，不發請求）", () => {
    useMyChallenges(false);
    expect(useQuery).toHaveBeenCalledWith("/api/v1/me/challenges", null, {
      revalidateOnFocus: false,
    });
  });
});
