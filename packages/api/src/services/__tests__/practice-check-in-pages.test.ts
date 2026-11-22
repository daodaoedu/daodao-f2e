import { describe, expect, it } from "vitest";
import { mergeCheckInPages } from "../practice-check-in-pages";

describe("complete practice check-in pages", () => {
  it("keeps older records after the first 30 and preserves the server total", () => {
    const first = {
      data: Array.from({ length: 30 }, (_, id) => ({ id })),
      pagination: { totalItems: 32, hasNext: true },
    };
    const last = { data: [{ id: 30 }, { id: 31 }], pagination: { totalItems: 32, hasNext: false } };
    const result = mergeCheckInPages([first, last]);
    expect(result?.data.map((row) => row.id)).toEqual(Array.from({ length: 32 }, (_, id) => id));
    expect(result?.pagination).toEqual({ totalItems: 32, hasNext: false });
  });
  it("does not count a record twice when offset pages overlap", () => {
    const result = mergeCheckInPages([
      { data: [{ id: 3 }, { id: 2 }], pagination: { totalItems: 3, hasNext: true } },
      { data: [{ id: 2 }, { id: 1 }], pagination: { totalItems: 3, hasNext: false } },
    ]);
    expect(result?.data.map((row) => row.id)).toEqual([3, 2, 1]);
  });
  it("does not invent a successful empty response before the first page", () => {
    expect(mergeCheckInPages(undefined)).toBeUndefined();
    expect(mergeCheckInPages([])).toBeUndefined();
  });
});
