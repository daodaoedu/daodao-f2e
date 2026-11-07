import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAllCachedOgImage, setCachedOgImage } from "@/lib/og-image-cache";

vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));

import { GET } from "../route";

let trap: Server | undefined;
afterEach(async () => {
  vi.restoreAllMocks();
  clearAllCachedOgImage();
  if (trap) {
    trap.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      trap?.close((error) => (error ? reject(error) : resolve()))
    );
    trap = undefined;
  }
});

function requestFor(url: string): Request {
  return new Request(`http://localhost/api/og-image?url=${encodeURIComponent(url)}`);
}

describe("OG source network boundary", () => {
  it("rejects a loopback target without connecting to the controlled private trap", async () => {
    const nativeFetch = globalThis.fetch;
    const transport = vi.spyOn(globalThis, "fetch");
    let connections = 0;
    let httpRequests = 0;
    trap = createServer((_request, response) => {
      httpRequests += 1;
      response.end(
        '<meta property="og:image" content="https://public.example/image.png"><meta property="og:title" content="PRIVATE_TRAP_SENTINEL">'
      );
    });
    trap.on("connection", () => {
      connections += 1;
    });
    await new Promise<void>((resolve) => trap?.listen(0, "127.0.0.1", resolve));
    const address = trap.address();
    if (!address || typeof address === "string") throw new Error("Trap listener missing");
    // The old normalizer discarded explicit ports. Remap only that synthetic
    // loopback transport to our unprivileged trap, retaining real HTTP I/O.
    // This is a disclosed transport fixture, not an unmodified network replay.
    transport.mockImplementation((input, init) => {
      const url = new URL(String(input));
      if (url.hostname === "127.0.0.1" && !url.port) url.port = String(address.port);
      return nativeFetch(url, init);
    });
    const response = await GET(requestFor(`http://127.0.0.1:${address.port}/private`));
    const body = await response.text();
    expect({
      status: response.status,
      body,
      transportCalls: transport.mock.calls.length,
      trapConnections: connections,
      httpRequests,
    }).toMatchObject({ status: 400, transportCalls: 0, trapConnections: 0, httpRequests: 0 });
    expect(body).not.toContain("PRIVATE_TRAP_SENTINEL");
    expect(connections).toBe(0);
    expect(transport).not.toHaveBeenCalled();
  });

  it("rejects a private source before serving pre-fix memory cache data", async () => {
    const target = "http://127.0.0.1/private";
    setCachedOgImage(target, {
      ogImageUrl: "https://public.example/private.png",
      title: "PRIVATE_CACHED_SENTINEL",
      timestamp: 1,
    });
    const response = await GET(requestFor(target));
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("PRIVATE_CACHED_SENTINEL");
  });
});
