import { describe, expect, it } from "vitest";
import { isExternalUrl } from "../external-link";

describe("isExternalUrl", () => {
  it("treats daodao.so and its subdomains as internal", () => {
    expect(isExternalUrl("https://daodao.so/practices/1", "localhost")).toBe(false);
    expect(isExternalUrl("https://app-dev.daodao.so/en/practices/1", "localhost")).toBe(false);
  });

  it("treats the current hostname as internal", () => {
    expect(isExternalUrl("http://localhost:3001/practices/1", "localhost")).toBe(false);
  });

  it("treats other sites as external", () => {
    expect(isExternalUrl("https://example.com", "app-dev.daodao.so")).toBe(true);
  });

  it("does not trust look-alike domains", () => {
    expect(isExternalUrl("https://daodao.so.evil.com", "app-dev.daodao.so")).toBe(true);
    expect(isExternalUrl("https://evildaodao.so", "app-dev.daodao.so")).toBe(true);
  });

  it("treats unparsable urls as external", () => {
    expect(isExternalUrl("https://", "app-dev.daodao.so")).toBe(true);
  });
});
