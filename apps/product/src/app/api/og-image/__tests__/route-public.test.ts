import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), request: vi.fn() }));
vi.mock("node:dns/promises", () => ({ lookup: mocks.lookup }));
vi.mock("node:http", () => ({ request: mocks.request }));
vi.mock("node:https", () => ({ request: mocks.request }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));

import { clearAllCachedOgImage, setCachedOgImage } from "@/lib/og-image-cache";
import { GET } from "../route";

const requestFor = (url: string) =>
  new Request(`http://localhost/api/og-image?url=${encodeURIComponent(url)}`);
beforeEach(() => {
  vi.clearAllMocks();
  clearAllCachedOgImage();
  mocks.lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }]);
  mocks.request.mockImplementation((url, _options, callback) => {
    const request = Object.assign(new EventEmitter(), {
      end: () =>
        queueMicrotask(() =>
          callback(
            Object.assign(
              Readable.from([
                `<meta property="og:image" content="/image.png"><meta property="og:title" content="${url.pathname}"><meta property="og:description" content="public description">`,
              ]),
              { statusCode: 200, headers: {} }
            )
          )
        ),
      destroy: vi.fn(),
    });
    return request;
  });
});
it("preserves public metadata schema and memory cache behavior", async () => {
  const first = await GET(requestFor("https://resource.example:8443/a/"));
  expect(first.status).toBe(200);
  expect(await first.json()).toMatchObject({
    success: true,
    data: {
      title: "/a/",
      description: "public description",
      ogImageUrl: "https://resource.example:8443/image.png",
      cached: false,
    },
  });
  const cached = await GET(requestFor("https://resource.example:8443/a/#fragment"));
  expect(await cached.json()).toMatchObject({ data: { title: "/a/", cached: true } });
  expect(mocks.request).toHaveBeenCalledTimes(1);
});
it("does not merge distinct trailing-slash paths", async () => {
  const first = await GET(requestFor("https://resource.example/a/"));
  const second = await GET(requestFor("https://resource.example/a"));
  expect(await first.json()).toMatchObject({ data: { title: "/a/" } });
  expect(await second.json()).toMatchObject({ data: { title: "/a" } });
  expect(mocks.request).toHaveBeenCalledTimes(2);
});
it("denies cached results when a formerly public hostname now resolves private", async () => {
  const target = "https://resource.example/a";
  setCachedOgImage(`public-v2:${target}`, {
    ogImageUrl: "https://public.example/image.png",
    title: "cached",
    timestamp: 1,
  });
  mocks.lookup.mockResolvedValue([{ address: "127.0.0.1", family: 4 }]);
  expect((await GET(requestFor(target))).status).toBe(400);
  expect(mocks.request).not.toHaveBeenCalled();
});
