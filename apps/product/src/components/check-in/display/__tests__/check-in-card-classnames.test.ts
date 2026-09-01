import { describe, expect, it } from "vitest";
import { MOOD_LABEL_CLASSNAME, TAG_CLASSNAME } from "../check-in-card-classnames";

describe("check-in card text wrap classNames", () => {
  it("keeps the mood label on a single line", () => {
    expect(MOOD_LABEL_CLASSNAME).toContain("whitespace-nowrap");
  });

  it("keeps a single tag's text on one line instead of breaking mid-word", () => {
    expect(TAG_CLASSNAME).toContain("whitespace-nowrap");
    expect(TAG_CLASSNAME).not.toContain("break-words");
  });
});
