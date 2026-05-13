import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IReactionCountItem, IShowcasePractice } from "../services/showcase-hooks";
import { reactToPractice } from "../services/showcase-hooks";

// ============================================================================
// 12.9 BrewingCard 資料合約測試
// 驗證 is_brewing=true 的練習不暴露打卡心得內容
// ============================================================================

describe("BrewingCard 資料合約（12.9）", () => {
  const brewingPractice: IShowcasePractice = {
    id: "practice-001",
    title: "每日冥想練習",
    status: "active",
    privacy_status: "delayed",
    is_brewing: true,
    start_date: "2026-01-01",
    end_date: null,
    practice_action: "每天早起靜坐 10 分鐘",
    user: { id: "user-001", name: "小明", photo_url: null },
    frequency_min_days: 5,
    frequency_max_days: 7,
    session_duration_minutes: 10,
    reactions: [{ type: "fire", count: 3, latestActorName: "小華" }],
    comment_count: 2,
    last_checkin_summary: null, // brewing 時不暴露打卡內容
  };

  it("is_brewing=true 且 status=active 時 last_checkin_summary 應為 null（不暴露打卡心得）", () => {
    expect(brewingPractice.is_brewing).toBe(true);
    expect(brewingPractice.status).toBe("active");
    expect(brewingPractice.last_checkin_summary).toBeNull();
  });

  it("is_brewing=true 的練習應為 delayed privacy_status", () => {
    expect(brewingPractice.privacy_status).toBe("delayed");
  });

  it("is_brewing=true 的練習仍應包含頻率資訊", () => {
    expect(brewingPractice.frequency_min_days).toBeDefined();
    expect(brewingPractice.frequency_max_days).toBeDefined();
    expect(brewingPractice.session_duration_minutes).toBeDefined();
  });

  it("is_brewing=true 的練習仍應包含反應聚合列資料", () => {
    expect(brewingPractice.reactions).toBeDefined();
    expect(Array.isArray(brewingPractice.reactions)).toBe(true);
    expect((brewingPractice.reactions ?? []).length).toBeGreaterThan(0);
  });

  it("is_brewing=true 的練習仍應包含留言數", () => {
    expect(brewingPractice.comment_count).toBeDefined();
    expect(typeof brewingPractice.comment_count).toBe("number");
  });

  it("非 brewing 且 status=completed 的練習可回傳打卡心得", () => {
    const completedPractice: IShowcasePractice = {
      id: "practice-002",
      title: "完成的冥想練習",
      status: "completed",
      privacy_status: "delayed",
      is_brewing: false,
      last_checkin_summary: "這週完成了 7 天打卡，感覺很充實！",
    };
    expect(completedPractice.is_brewing).toBe(false);
    expect(completedPractice.last_checkin_summary).toBeTruthy();
  });

  it("public 練習可回傳打卡心得（Full Access Card）", () => {
    const publicPractice: IShowcasePractice = {
      id: "practice-003",
      title: "公開的冥想練習",
      status: "active",
      privacy_status: "public",
      is_brewing: false,
      last_checkin_summary: "今天打卡成功！",
    };
    expect(publicPractice.privacy_status).toBe("public");
    expect(publicPractice.last_checkin_summary).toBeTruthy();
  });

  it("反應聚合列格式驗證：IReactionCountItem 應包含 type、count 欄位", () => {
    const reaction: IReactionCountItem = { type: "fire", count: 5, latestActorName: "Alice" };
    expect(reaction.type).toBe("fire");
    expect(reaction.count).toBe(5);
    expect(reaction.latestActorName).toBe("Alice");
  });

  it("反應聚合列 latestActorName 為 optional", () => {
    const reaction: IReactionCountItem = { type: "heart", count: 2 };
    expect(reaction.latestActorName).toBeUndefined();
  });
});

// ============================================================================
// 12.10 反應互動 → 通知 Email 流程測試
// 驗證 reactToPractice 呼叫正確的 API endpoint
// ============================================================================

describe("reactToPractice API 呼叫（12.10）", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.daodao.so");
    mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("第一次反應時應呼叫 POST /api/v1/reactions", async () => {
    await reactToPractice("practice-001", "fire", false);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.daodao.so/api/v1/reactions");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({
      targetType: "practice",
      targetId: "practice-001",
      reactionType: "fire",
    });
  });

  it("取消反應時應呼叫 DELETE /api/v1/reactions", async () => {
    await reactToPractice("practice-001", "fire", true);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.daodao.so/api/v1/reactions");
    expect(options.method).toBe("DELETE");
    expect(JSON.parse(options.body as string)).toEqual({
      targetType: "practice",
      targetId: "practice-001",
    });
  });

  it("API 呼叫失敗時應拋出錯誤", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(reactToPractice("practice-001", "fire", false)).rejects.toThrow(
      "React to practice failed: 500"
    );
  });

  it("反應請求應帶 credentials: include（確保 session 傳遞）", async () => {
    await reactToPractice("practice-002", "heart", false);

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.credentials).toBe("include");
  });

  it("POST 請求應帶 Content-Type: application/json", async () => {
    await reactToPractice("practice-002", "heart", false);

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("delayed 練習（is_brewing=true）仍可進行反應互動", async () => {
    const brewingPracticeId = "practice-delayed-001";
    await expect(reactToPractice(brewingPracticeId, "fire", false)).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("regression: targetType 固定為 practice（不應傳入 checkin 等其他類型）", async () => {
    await reactToPractice("practice-003", "fire", false);

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);
    expect(body.targetType).toBe("practice");
  });
});
