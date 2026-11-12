import { describe, expect, it } from "vitest";
import { newestFirst } from "../newest-first";

const ids = (rows: { id: number; createdAt: string }[]) =>
  [...rows].sort(newestFirst).map((r) => r.id);

describe("newestFirst（#521 AC-04：新建立的系列與場次排最上方）", () => {
  it("places the most recently created item first regardless of id or input order", () => {
    expect(
      ids([
        { id: 3, createdAt: "2026-11-01T00:00:00.000Z" },
        { id: 1, createdAt: "2026-11-12T08:00:00.000Z" },
        { id: 2, createdAt: "2026-11-05T00:00:00.000Z" },
      ])
    ).toEqual([1, 2, 3]);
  });

  it("puts the larger id first when created at the same instant", () => {
    expect(
      ids([
        { id: 7, createdAt: "2026-11-12T08:00:00.000Z" },
        { id: 9, createdAt: "2026-11-12T08:00:00.000Z" },
      ])
    ).toEqual([9, 7]);
  });

  it("falls back to id order instead of leaving NaN comparisons when createdAt is unparseable", () => {
    expect(
      ids([
        { id: 4, createdAt: "not-a-date" },
        { id: 6, createdAt: "2026-11-12T08:00:00.000Z" },
      ])
    ).toEqual([6, 4]);
  });
});
