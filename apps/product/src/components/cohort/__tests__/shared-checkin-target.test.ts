import { describe, expect, it } from "vitest";
import { resolveSharedCheckinTarget, type SharedCheckinPractice } from "../shared-checkin-target";

const NOW = new Date(2026, 10, 22, 9, 0); // 2026-11-22 當地上午
const practice = (overrides: Partial<SharedCheckinPractice> = {}): SharedCheckinPractice => ({
  id: "11111111-1111-4111-8111-111111111111",
  status: "active",
  templateId: 50,
  startDate: "2026-11-01T00:00:00.000Z",
  endDate: "2026-11-30T00:00:00.000Z",
  ...overrides,
});

describe("resolveSharedCheckinTarget", () => {
  it("同模板只有一筆、期間內的實踐可以直接打卡", () => {
    const own = practice();
    expect(resolveSharedCheckinTarget([own], 50, NOW)).toEqual({ kind: "ready", practice: own });
  });

  it("只挑連結指定模板的實踐，不受其他模板實踐影響", () => {
    const other = practice({ id: "22222222-2222-4222-8222-222222222222", templateId: 51 });
    const own = practice();
    expect(resolveSharedCheckinTarget([other, own], 50, NOW)).toEqual({
      kind: "ready",
      practice: own,
    });
  });

  it("沒有該模板的實踐時回報找不到，不回退到其他模板或沒有模板的實踐", () => {
    const practices = [practice({ templateId: 51 }), practice({ templateId: null })];
    expect(resolveSharedCheckinTarget(practices, 50, NOW)).toEqual({ kind: "not_found" });
    expect(resolveSharedCheckinTarget([], 50, NOW)).toEqual({ kind: "not_found" });
  });

  it("同模板有多筆時視為資料歧義，不任意挑選", () => {
    const practices = [practice(), practice({ id: "33333333-3333-4333-8333-333333333333" })];
    expect(resolveSharedCheckinTarget(practices, 50, NOW)).toEqual({ kind: "ambiguous", count: 2 });
  });

  it("草稿實踐需先啟用，回報不可用", () => {
    expect(resolveSharedCheckinTarget([practice({ status: "draft" })], 50, NOW).kind).toBe(
      "unavailable"
    );
  });

  it("封存實踐無法重新啟用，回報已結束而非引導啟用", () => {
    expect(resolveSharedCheckinTarget([practice({ status: "archived" })], 50, NOW).kind).toBe(
      "ended"
    );
  });

  it("開始日在明天時回報尚未開始；開始日是今天則可打卡", () => {
    expect(
      resolveSharedCheckinTarget(
        [practice({ status: "not_started", startDate: "2026-11-23T00:00:00.000Z" })],
        50,
        NOW
      ).kind
    ).toBe("not_started");
    expect(
      resolveSharedCheckinTarget(
        [practice({ status: "not_started", startDate: "2026-11-22T00:00:00.000Z" })],
        50,
        NOW
      ).kind
    ).toBe("ready");
  });

  it("已完成或結束日已過時回報已結束；結束日當天仍可打卡", () => {
    expect(resolveSharedCheckinTarget([practice({ status: "completed" })], 50, NOW).kind).toBe(
      "ended"
    );
    expect(
      resolveSharedCheckinTarget([practice({ endDate: "2026-11-21T00:00:00.000Z" })], 50, NOW).kind
    ).toBe("ended");
    expect(
      resolveSharedCheckinTarget([practice({ endDate: "2026-11-22T00:00:00.000Z" })], 50, NOW).kind
    ).toBe("ready");
  });
});
