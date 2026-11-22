import type { PracticeCheckInsResponse } from "@daodao/api";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CheckInRecordCard } from "@/components/check-in/display/check-in-record-card";
import { CHECK_IN_MOOD_OPTIONS, mapApiMoodToMoodType, mapMoodTypeToApiMood } from "../mood";

vi.mock("@daodao/i18n", () => ({ useTranslations: () => (key: string) => key }));

describe("historical check-in mood compatibility", () => {
  it("counts historical bored separately from neutral instead of hiding it", () => {
    const data = {
      data: [{ mood: "bored" }, { mood: "bored" }, { mood: "neutral" }],
    } as PracticeCheckInsResponse;
    const markup = renderToStaticMarkup(<CheckInRecordCard checkInsData={data} />);
    expect(markup).toContain('aria-label="moods.bored: 2"');
    expect(markup).toContain('aria-label="moods.neutral: 1"');
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
