import type { PracticeCheckInsResponse } from "@daodao/api";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CheckInRecordCard } from "@/components/check-in/display/check-in-record-card";
import { CHECK_IN_MOOD_OPTIONS, mapApiMoodToMoodType, mapMoodTypeToApiMood } from "../mood";

vi.mock("@daodao/i18n", () => ({ useTranslations: () => (key: string) => key }));

describe("historical check-in mood compatibility", () => {
  it("charts historical bored separately from neutral with proportional segments", () => {
    const data = {
      data: [{ mood: "neutral" }, { mood: "bored" }, { mood: "bored" }, { mood: "bored" }],
    } as PracticeCheckInsResponse;
    const markup = renderToStaticMarkup(<CheckInRecordCard checkInsData={data} />);
    expect(markup).toMatch(/width:75%.*width:25%/);
    expect(markup).toMatch(/moods\.bored<small[^>]*> \(3\)<\/small>/);
    expect(markup).toMatch(/moods\.neutral<small[^>]*> \(1\)<\/small>/);
    expect(markup).not.toContain("moods.happy");
  });

  it("preserves existing six-value API roundtrip without adding bored to five new choices", () => {
    expect(mapMoodTypeToApiMood(mapApiMoodToMoodType("bored"))).toBe("bored");
    expect(CHECK_IN_MOOD_OPTIONS.map((option) => option.id)).toEqual([
      "hopeless",
      "frustrated",
      "neutral",
      "fine",
      "happy",
    ]);
  });
});
