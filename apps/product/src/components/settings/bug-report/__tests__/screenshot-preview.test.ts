import { describe, expect, it } from "vitest";
import { createScreenshotPreviewUrl } from "../screenshot-preview";

// app／app-dev 的 nginx CSP 為 `img-src 'self' data: https:`，blob: 預覽會被擋成破圖（daodao#166）
const CSP_IMG_SRC_SCHEMES = ["data:", "https:"];

const png = (bytes: number[], type = "image/png") =>
  new File([new Uint8Array(bytes)], "shot.png", { type });

describe("createScreenshotPreviewUrl", () => {
  it("returns a data: URL that the CSP img-src allows", async () => {
    const url = await createScreenshotPreviewUrl(png([0x89, 0x50, 0x4e, 0x47]));

    expect(url.startsWith("blob:")).toBe(false);
    expect(CSP_IMG_SRC_SCHEMES.some((scheme) => url.startsWith(scheme))).toBe(true);
    expect(url).toBe("data:image/png;base64,iVBORw==");
  });

  it("encodes files larger than one chunk without losing bytes", async () => {
    const bytes = Array.from({ length: 70_000 }, (_, i) => i % 256);
    const url = await createScreenshotPreviewUrl(png(bytes, "image/jpeg"));

    expect(url.startsWith("data:image/jpeg;base64,")).toBe(true);
    const decoded = Buffer.from(url.slice("data:image/jpeg;base64,".length), "base64");
    expect([...decoded]).toEqual(bytes);
  });
});
