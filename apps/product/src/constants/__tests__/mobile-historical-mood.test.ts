import { describe, expect, it, vi } from "vitest";
import { createCheckInFormSchema } from "../../../../mobile/components/check-in/form/schema";
import { MOOD_OPTIONS } from "../../../../mobile/constants/mood";

vi.mock("@/constants/mood", () => import("../../../../mobile/constants/mood"));
vi.mock("@daodao/assets/images/emotion/bored.svg", () => ({ default: () => null }));
vi.mock("@daodao/assets/images/emotion/fine.svg", () => ({ default: () => null }));
vi.mock("@daodao/assets/images/emotion/frustrated.svg", () => ({ default: () => null }));
vi.mock("@daodao/assets/images/emotion/happy.svg", () => ({ default: () => null }));
vi.mock("@daodao/assets/images/emotion/hopeless.svg", () => ({ default: () => null }));
vi.mock("@daodao/assets/images/emotion/neutral.svg", () => ({ default: () => null }));
describe("mobile historical mood editing", () => {
  it("keeps bored unchanged while editing other fields without adding a sixth selector choice", () => {
    const data = { mood: "bored", tags: ["changed"], description: "保留舊心情", mediaUris: [] };
    expect(createCheckInFormSchema((key) => key).parse(data)).toEqual(data);
    expect(MOOD_OPTIONS.map((option) => option.id)).toEqual([
      "hopeless",
      "frustrated",
      "neutral",
      "fine",
      "happy",
    ]);
  });
});
