import { describe, expect, it } from "vitest";
import { buildCheerDisplay, formatShowcaseDate } from "../utils";

describe("formatShowcaseDate", () => {
  it("returns null when input is undefined", () => {
    expect(formatShowcaseDate(undefined)).toBeNull();
  });

  it("returns null when input is null", () => {
    expect(formatShowcaseDate(null)).toBeNull();
  });

  it("formats a valid ISO date string to yyyy/MM/dd", () => {
    // Use date-only string (no time zone) to avoid CI timezone sensitivity
    expect(formatShowcaseDate("2025-03-15")).toBe("2025/03/15");
  });

  it("formats a date-only ISO string", () => {
    expect(formatShowcaseDate("2024-12-01")).toBe("2024/12/01");
  });

  it("returns null for an invalid date string", () => {
    expect(formatShowcaseDate("invalid-date")).toBeNull();
  });
});

describe("buildCheerDisplay", () => {
  it("returns null when reactions is undefined", () => {
    expect(buildCheerDisplay(undefined)).toBeNull();
  });

  it("returns null when reactions is empty", () => {
    expect(buildCheerDisplay([])).toBeNull();
  });

  it("returns null when all reactions have count 0", () => {
    expect(buildCheerDisplay([{ type: "fire", count: 0, latestActorName: null }])).toBeNull();
  });

  it("returns displayText with actorName when single reaction and latestActorName is set", () => {
    const result = buildCheerDisplay([
      { type: "fire", count: 1, latestActorName: "Alice" },
    ]);
    expect(result).not.toBeNull();
    expect(result?.displayText).toBe("Alice");
  });

  it("returns displayText with actorName and others count when multiple types", () => {
    const result = buildCheerDisplay([
      { type: "fire", count: 3, latestActorName: "Alice" },
      { type: "encourage", count: 2, latestActorName: "Bob" },
    ]);
    expect(result).not.toBeNull();
    // topReaction is fire (count=3), totalOthers = 2
    expect(result?.displayText).toBe("Alice 與其他 2 人");
  });

  it("returns total count as displayText when latestActorName is absent", () => {
    const result = buildCheerDisplay([
      { type: "fire", count: 5, latestActorName: null },
      { type: "encourage", count: 3, latestActorName: null },
    ]);
    expect(result).not.toBeNull();
    expect(result?.displayText).toBe("8 人");
  });

  it("includes up to 4 emojis from top reactions", () => {
    const result = buildCheerDisplay([
      { type: "useful", count: 10, latestActorName: "A" },
      { type: "fire", count: 8, latestActorName: "B" },
      { type: "touched", count: 6, latestActorName: "C" },
      { type: "curious", count: 4, latestActorName: "D" },
      { type: "encourage", count: 2, latestActorName: "E" },
    ]);
    expect(result).not.toBeNull();
    expect(result?.emojis.length).toBe(4);
  });

  it("returns correct emoji for known reaction type", () => {
    const result = buildCheerDisplay([
      { type: "fire", count: 1, latestActorName: null },
    ]);
    expect(result?.emojis).toContain("🔥");
  });
});
