import { describe, expect, it } from "vitest";
import { CHECK_IN_IMAGE_ACCEPTED_TYPES, CHECK_IN_MAX_IMAGES } from "../check-in-image";

describe("check-in image constants", () => {
  it("only accepts image MIME types, not video", () => {
    const hasVideo = CHECK_IN_IMAGE_ACCEPTED_TYPES.some((t) => t.startsWith("video/"));
    expect(hasVideo).toBe(false);
  });

  it("all accepted types are image MIME types", () => {
    for (const type of CHECK_IN_IMAGE_ACCEPTED_TYPES) {
      expect(type.startsWith("image/")).toBe(true);
    }
  });

  it("limits to 3 images maximum", () => {
    expect(CHECK_IN_MAX_IMAGES).toBe(3);
  });
});
