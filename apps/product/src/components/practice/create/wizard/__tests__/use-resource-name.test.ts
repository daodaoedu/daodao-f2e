import { beforeEach, describe, expect, it, vi } from "vitest";

const extractOgImage = vi.fn();
vi.mock("@daodao/api", () => ({ extractOgImage }));

const { fetchOgTitle, knownDomainName, resolveResourceName, resolveResourceNameWith } =
  await import("../use-resource-name");

describe("knownDomainName", () => {
  it("maps known hosts ignoring www. and case", () => {
    expect(knownDomainName("https://www.books.com.tw/")).toBe("博客來");
    expect(knownDomainName("https://YouTu.be/abc")).toBe("YouTube");
  });

  it("returns null for unknown or unparseable urls", () => {
    expect(knownDomainName("https://example.com/x")).toBeNull();
    expect(knownDomainName("not a url")).toBeNull();
  });
});

describe("resolveResourceNameWith ordering", () => {
  it("1. known domain wins and never calls the fetcher", async () => {
    const fetcher = vi.fn().mockResolvedValue("Some og title");
    await expect(
      resolveResourceNameWith("https://www.books.com.tw/products/1", fetcher)
    ).resolves.toBe("博客來");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("2. og:title is used when present (trimmed, max 100 chars)", async () => {
    const long = `  ${"a".repeat(150)}  `;
    const fetcher = vi.fn().mockResolvedValue(long);
    await expect(
      resolveResourceNameWith("https://example.com/learn/atomic-habits", fetcher)
    ).resolves.toBe("a".repeat(100));
    expect(fetcher).toHaveBeenCalledWith("https://example.com/learn/atomic-habits");
  });

  it("3. falls back to path derivation when og:title is empty", async () => {
    const fetcher = vi.fn().mockResolvedValue("   ");
    await expect(
      resolveResourceNameWith("https://example.com/learn/atomic-habits", fetcher)
    ).resolves.toBe("atomic habits｜example.com");
  });

  it("3. falls back to path derivation when the fetcher rejects", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(
      resolveResourceNameWith("https://example.com/learn/atomic-habits", fetcher)
    ).resolves.toBe("atomic habits｜example.com");
  });

  it("3. falls back when the fetcher exceeds the timeout", async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn(() => new Promise<string | null>(() => {}));
      const pending = resolveResourceNameWith(
        "https://example.com/learn/atomic-habits",
        fetcher,
        50
      );
      await vi.advanceTimersByTimeAsync(60);
      await expect(pending).resolves.toBe("atomic habits｜example.com");
    } finally {
      vi.useRealTimers();
    }
  });

  it("4. falls back to the host when the last segment is hex-like", async () => {
    const fetcher = vi.fn().mockResolvedValue(null);
    await expect(
      resolveResourceNameWith("https://example.com/p/0123456789abcdef0123456789abcdef", fetcher)
    ).resolves.toBe("example.com");
  });

  it("returns null (manual mode) only when the url cannot be parsed", async () => {
    const fetcher = vi.fn().mockResolvedValue("title");
    await expect(resolveResourceNameWith("not a url", fetcher)).resolves.toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("fetchOgTitle / resolveResourceName (extractOgImage wiring)", () => {
  beforeEach(() => {
    extractOgImage.mockReset();
  });

  it("returns data.title on success", async () => {
    extractOgImage.mockResolvedValue({
      success: true,
      data: { ogImageUrl: "", title: "Atomic Habits", cached: false, timestamp: 0 },
    });
    await expect(fetchOgTitle("https://example.com/x")).resolves.toBe("Atomic Habits");
    await expect(resolveResourceName("https://example.com/learn/atomic-habits")).resolves.toBe(
      "Atomic Habits"
    );
    expect(extractOgImage).toHaveBeenCalledWith({ url: "https://example.com/learn/atomic-habits" });
  });

  it("returns null when the api reports failure or no title", async () => {
    extractOgImage.mockResolvedValue({ success: false, error: "nope" });
    await expect(fetchOgTitle("https://example.com/x")).resolves.toBeNull();
    extractOgImage.mockResolvedValue({
      success: true,
      data: { ogImageUrl: "", cached: false, timestamp: 0 },
    });
    await expect(resolveResourceName("https://example.com/learn/atomic-habits")).resolves.toBe(
      "atomic habits｜example.com"
    );
  });
});
