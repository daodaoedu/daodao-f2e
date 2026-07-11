import { describe, expect, it } from "vitest";
import { createReactNativeFormDataFile, getMimeTypeFromUri } from "../form-data-file";

describe("getMimeTypeFromUri", () => {
  it("detects common image extensions", () => {
    expect(getMimeTypeFromUri("file:///tmp/a.jpg")).toBe("image/jpeg");
    expect(getMimeTypeFromUri("file:///tmp/a.JPEG")).toBe("image/jpeg");
    expect(getMimeTypeFromUri("file:///tmp/a.png")).toBe("image/png");
    expect(getMimeTypeFromUri("file:///tmp/a.webp?cache=1")).toBe("image/webp");
    expect(getMimeTypeFromUri("file:///tmp/a.heic")).toBe("image/heic");
  });

  it("defaults unknown extensions to jpeg", () => {
    expect(getMimeTypeFromUri("file:///tmp/photo")).toBe("image/jpeg");
    expect(getMimeTypeFromUri("ph://asset-id")).toBe("image/jpeg");
  });
});

describe("createReactNativeFormDataFile", () => {
  it("builds RN FormData file parts", () => {
    expect(createReactNativeFormDataFile("file:///tmp/shot.png", 2)).toEqual({
      uri: "file:///tmp/shot.png",
      type: "image/png",
      name: "image-2.png",
    });
  });

  it("strips query strings from extension detection", () => {
    expect(createReactNativeFormDataFile("file:///tmp/x.jpg?ts=1", 0).name).toBe("image-0.jpg");
  });
});
