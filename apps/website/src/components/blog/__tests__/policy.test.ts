import { describe, expect, it } from "vitest";
import { assertPreviewOrigin } from "../policy";

describe("draft publication boundary", () => {
  it("rejects production and unspecified origins for drafts", () => {
    for (const origin of ["", "not a URL", "https://daodao.so", "https://www.daodao.so/blog"]) {
      expect(() => assertPreviewOrigin("draft", origin)).toThrow();
    }
  });
  it("allows explicit preview origins", () => {
    expect(() => assertPreviewOrigin("draft", "http://localhost:8544")).not.toThrow();
    expect(() => assertPreviewOrigin("publish", "https://daodao.so")).not.toThrow();
  });
});
