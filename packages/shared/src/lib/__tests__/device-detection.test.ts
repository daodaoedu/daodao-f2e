import { describe, expect, it } from "vitest";
import { detectDeviceFromUserAgent } from "../device-detection";

describe("detectDeviceFromUserAgent", () => {
  it("detects iPhone as mobile", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";
    const result = detectDeviceFromUserAgent(ua);
    expect(result).toEqual({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      deviceType: "mobile",
    });
  });

  it("detects Android phone as mobile", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36";
    const result = detectDeviceFromUserAgent(ua);
    expect(result).toEqual({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      deviceType: "mobile",
    });
  });

  it("detects iPad as tablet", () => {
    const ua =
      "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/604.1";
    const result = detectDeviceFromUserAgent(ua);
    expect(result).toEqual({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      deviceType: "tablet",
    });
  });

  it("detects Android tablet (no Mobile keyword) as tablet", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 13; SM-X800) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
    const result = detectDeviceFromUserAgent(ua);
    expect(result).toEqual({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      deviceType: "tablet",
    });
  });

  it("detects desktop Chrome as desktop", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
    const result = detectDeviceFromUserAgent(ua);
    expect(result).toEqual({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: "desktop",
    });
  });

  it("detects desktop Firefox as desktop", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0";
    const result = detectDeviceFromUserAgent(ua);
    expect(result).toEqual({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: "desktop",
    });
  });

  it("detects empty string as desktop", () => {
    const result = detectDeviceFromUserAgent("");
    expect(result).toEqual({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: "desktop",
    });
  });
});
