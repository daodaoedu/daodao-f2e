import { describe, expect, it } from "vitest";
import { countCommentsWithReplies } from "../count-comments";

describe("countCommentsWithReplies", () => {
  it("returns 0 for non-array input", () => {
    expect(countCommentsWithReplies(null)).toBe(0);
    expect(countCommentsWithReplies(undefined)).toBe(0);
    expect(countCommentsWithReplies("string")).toBe(0);
  });

  it("counts top-level comments with no replies", () => {
    const comments = [
      { id: 1, content: "Hello" },
      { id: 2, content: "World" },
    ];
    expect(countCommentsWithReplies(comments)).toBe(2);
  });

  it("includes second-level replies in total count", () => {
    const comments = [
      { id: 1, content: "Parent", replies: [{ id: 3, content: "Reply A" }, { id: 4, content: "Reply B" }] },
      { id: 2, content: "Parent 2", replies: [] },
    ];
    expect(countCommentsWithReplies(comments)).toBe(4);
  });

  it("skips invalid reply entries that lack an id", () => {
    const comments = [
      { id: 1, replies: [{ id: 2 }, null, "invalid", { id: 3 }] },
    ];
    expect(countCommentsWithReplies(comments)).toBe(3);
  });

  it("returns 0 for empty array", () => {
    expect(countCommentsWithReplies([])).toBe(0);
  });
});
