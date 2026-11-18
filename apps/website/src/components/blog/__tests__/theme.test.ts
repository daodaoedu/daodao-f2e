import { describe, expect, it } from "vitest";
import { readBlogDark, writeBlogDark } from "../theme";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

const blocked = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
};

describe("Journal theme preference", () => {
  it("defaults to light for a first-time reader", () => {
    expect(readBlogDark(memoryStorage())).toBe(false);
    expect(readBlogDark(undefined)).toBe(false);
  });

  it("keeps dark after the reader chooses it, so the next page opens dark", () => {
    const storage = memoryStorage();
    writeBlogDark(storage, true);
    expect(readBlogDark(storage)).toBe(true);
    writeBlogDark(storage, false);
    expect(readBlogDark(storage)).toBe(false);
  });

  it("falls back to light without throwing when site data is blocked", () => {
    expect(() => writeBlogDark(blocked, true)).not.toThrow();
    expect(readBlogDark(blocked)).toBe(false);
  });
});
