import { describe, expect, it } from "vitest";
import { getLetterDetailScrollKey, getLetterDetailView } from "../future-letter-utils";

describe("future letter detail view", () => {
  it("returns no detail when nothing is selected or the letter is still a draft", () => {
    expect(getLetterDetailView(undefined)).toBeNull();
    expect(getLetterDetailView({ id: "a", status: "draft" })).toBeNull();
  });

  it("maps each lifecycle state to the detail block shown under the timeline", () => {
    expect(getLetterDetailView({ id: "a", status: "scheduled" })).toBe("sealed");
    expect(getLetterDetailView({ id: "a", status: "delivered", openedAt: null })).toBe("unopened");
    expect(
      getLetterDetailView({ id: "a", status: "delivered", openedAt: "2026-10-21T00:00:00.000Z" })
    ).toBe("opened");
  });
});

// Regression for #164: clicking a sent / read letter card rendered the detail block after the
// whole timeline, so the viewport stayed put. The scroll key drives scrolling the detail block
// into view; it must change whenever a different letter or a different detail block is shown.
describe("future letter detail scroll key", () => {
  it("is null when there is no detail block to bring into view", () => {
    expect(getLetterDetailScrollKey(undefined)).toBeNull();
    expect(getLetterDetailScrollKey({ id: "a", status: "draft" })).toBeNull();
  });

  it("differs between selected letters so each card click scrolls to its own detail", () => {
    const sent = getLetterDetailScrollKey({ id: "sent", status: "scheduled" });
    const read = getLetterDetailScrollKey({
      id: "read",
      status: "delivered",
      openedAt: "2026-10-16T00:00:00.000Z",
    });
    expect(sent).not.toBeNull();
    expect(read).not.toBeNull();
    expect(sent).not.toBe(read);
  });

  it("changes after an unopened letter is opened so the revealed content is brought into view", () => {
    const before = getLetterDetailScrollKey({ id: "a", status: "delivered", openedAt: null });
    const after = getLetterDetailScrollKey({
      id: "a",
      status: "delivered",
      openedAt: "2026-10-22T00:00:00.000Z",
    });
    expect(before).not.toBe(after);
  });
});
