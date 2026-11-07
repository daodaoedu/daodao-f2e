import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { gzipSync } from "node:zlib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), request: vi.fn() }));
vi.mock("node:dns/promises", () => ({ lookup: mocks.lookup }));
vi.mock("node:http", () => ({ request: mocks.request }));
vi.mock("node:https", () => ({ request: mocks.request }));

import { fetchPublicHtml, isPublicAddress, validatePublicUrl } from "../safe-public-fetch";

interface IReply {
  status?: number;
  location?: string;
  body?: Buffer | string;
  encoding?: string;
  stall?: boolean;
}
let replies: IReply[];
let requests: Array<
  EventEmitter & { end: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }
>;
beforeEach(() => {
  vi.clearAllMocks();
  replies = [];
  requests = [];
  mocks.lookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
  mocks.request.mockImplementation((_url, _options, callback) => {
    const request = Object.assign(new EventEmitter(), { end: vi.fn(), destroy: vi.fn() });
    requests.push(request);
    request.end.mockImplementation(() =>
      queueMicrotask(() => {
        const reply = replies.shift() ?? {};
        if (reply.stall) return;
        const response = Object.assign(Readable.from([reply.body ?? "public page"]), {
          statusCode: reply.status ?? 200,
          headers: { location: reply.location, "content-encoding": reply.encoding },
        });
        callback(response);
      })
    );
    return request;
  });
});
afterEach(() => vi.useRealTimers());

describe("public address policy", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "100.64.0.1",
    "192.168.1.1",
    "172.16.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "192.0.2.1",
    "::1",
    "::ffff:8.8.8.8",
    "fc00::1",
    "fe80::1",
    "2001:db8::1",
    "2002:808:808::1",
    "2606:4700::1%eth0",
  ])("rejects %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
  it.each(["8.8.8.8", "93.184.216.34", "2606:4700:4700::1111"])("allows public %s", (address) =>
    expect(isPublicAddress(address)).toBe(true));
  it.each([
    "http://2130706433/",
    "http://0x7f000001/",
    "http://0177.0.0.1/",
    "http://[::ffff:127.0.0.1]/",
    "https://user:password@example.com/",
    "file:///tmp/test",
  ])("blocks URL %s before transport", async (url) => {
    await expect(fetchPublicHtml(url)).rejects.toThrow();
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it.each([
    { addresses: [] },
    {
      addresses: [
        { address: "8.8.8.8", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ],
    },
    {
      addresses: [
        { address: "8.8.8.8", family: 4 },
        { address: "fe80::1", family: 6 },
      ],
    },
  ])("fails closed for empty or mixed DNS results %#", async ({ addresses }) => {
    mocks.lookup.mockResolvedValue(addresses);
    await expect(fetchPublicHtml("https://resource.example/")).rejects.toThrow();
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it("fails closed on DNS errors", async () => {
    mocks.lookup.mockRejectedValue(new Error("ENOTFOUND"));
    await expect(fetchPublicHtml("https://resource.example/")).rejects.toThrow("ENOTFOUND");
    expect(mocks.request).not.toHaveBeenCalled();
  });
});

describe("validated socket transport", () => {
  it.each([
    { address: "93.184.216.34", family: 4 },
    { address: "2606:4700:4700::1111", family: 6 },
  ])("pins $address and retains URL TLS identity", async (answer) => {
    mocks.lookup.mockResolvedValue([answer]);
    await expect(fetchPublicHtml("https://resource.example:8443/a/")).resolves.toEqual({
      html: "public page",
      finalUrl: "https://resource.example:8443/a/",
    });
    const [url, options] = mocks.request.mock.calls[0] ?? [];
    expect(url.href).toBe("https://resource.example:8443/a/");
    expect(options).toMatchObject({
      family: answer.family,
      servername: "resource.example",
      agent: false,
    });
    expect(options.rejectUnauthorized).not.toBe(false);
    // A second system lookup may now return private data. Socket lookup must use
    // the captured validated address, never query DNS again.
    mocks.lookup.mockResolvedValue([{ address: "127.0.0.1", family: 4 }]);
    const callback = vi.fn();
    options.lookup("resource.example", {}, callback);
    expect(callback).toHaveBeenCalledWith(null, answer.address, answer.family);
    expect(mocks.lookup).toHaveBeenCalledTimes(1);
    const allCallback = vi.fn();
    options.lookup("resource.example", { all: true }, allCallback);
    expect(allCallback).toHaveBeenCalledWith(null, [answer]);
  });
  it("revalidates DNS after an earlier cache authorization", async () => {
    await validatePublicUrl("https://resource.example/");
    mocks.lookup.mockResolvedValue([{ address: "127.0.0.1", family: 4 }]);
    await expect(fetchPublicHtml("https://resource.example/")).rejects.toThrow();
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it("never opens a private redirect destination", async () => {
    replies.push({ status: 302, location: "http://169.254.169.254/private" });
    await expect(fetchPublicHtml("https://resource.example/")).rejects.toThrow();
    expect(mocks.request).toHaveBeenCalledTimes(1);
  });
  it("follows public relative redirects and resolves metadata against final URL", async () => {
    replies.push({ status: 302, location: "../final/" }, { body: "final html" });
    await expect(fetchPublicHtml("https://resource.example/start/a")).resolves.toEqual({
      html: "final html",
      finalUrl: "https://resource.example/final/",
    });
    expect(mocks.lookup).toHaveBeenCalledTimes(2);
  });
  it("bounds redirect loops", async () => {
    replies.push(...Array.from({ length: 6 }, () => ({ status: 302, location: "/again" })));
    await expect(fetchPublicHtml("https://resource.example/")).rejects.toThrow("redirect limit");
    expect(mocks.request).toHaveBeenCalledTimes(6);
  });
  it.each([
    { body: Buffer.alloc(2 * 1024 * 1024 + 1), encoding: undefined },
    { body: gzipSync(Buffer.alloc(2 * 1024 * 1024 + 1)), encoding: "gzip" },
  ])("bounds raw and expanded bodies %#", async (reply) => {
    replies.push(reply);
    await expect(fetchPublicHtml("https://resource.example/")).rejects.toThrow();
  });
  it("decodes ordinary compressed public HTML", async () => {
    replies.push({ body: gzipSync("<title>public</title>"), encoding: "gzip" });
    await expect(fetchPublicHtml("https://resource.example/")).resolves.toMatchObject({
      html: "<title>public</title>",
    });
  });
  it("destroys a stalled request at the total deadline", async () => {
    vi.useFakeTimers();
    replies.push({ stall: true });
    const pending = expect(fetchPublicHtml("https://resource.example/")).rejects.toThrow(
      "timed out"
    );
    await vi.advanceTimersByTimeAsync(10_001);
    await pending;
    expect(requests[0]?.destroy).toHaveBeenCalledOnce();
  });
  it("retries only vetted alternate addresses after a connection failure", async () => {
    mocks.lookup.mockResolvedValue([
      { address: "2606:4700:4700::1111", family: 6 },
      { address: "8.8.8.8", family: 4 },
    ]);
    mocks.request.mockImplementationOnce(() => {
      const request = Object.assign(new EventEmitter(), {
        end: () => queueMicrotask(() => request.emit("error", new Error("ENETUNREACH"))),
        destroy: vi.fn(),
      });
      return request;
    });
    await expect(fetchPublicHtml("https://resource.example/")).resolves.toMatchObject({
      html: "public page",
    });
    expect(mocks.lookup).toHaveBeenCalledTimes(1);
    expect(mocks.request).toHaveBeenCalledTimes(2);
    expect(mocks.request.mock.calls[1]?.[1]).toMatchObject({ family: 4 });
  });
  it("does not reset the fetch deadline after slow DNS", async () => {
    vi.useFakeTimers();
    mocks.lookup.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve([{ address: "8.8.8.8", family: 4 }]), 8_000)
        )
    );
    replies.push({ stall: true });
    const pending = expect(fetchPublicHtml("https://resource.example/")).rejects.toThrow(
      "timed out"
    );
    await vi.advanceTimersByTimeAsync(8_000);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2_001);
    await pending;
    expect(requests[0]?.destroy).toHaveBeenCalledOnce();
  });
  it("bounds DNS delay without creating a socket", async () => {
    vi.useFakeTimers();
    mocks.lookup.mockReturnValue(new Promise(() => {}));
    const pending = expect(fetchPublicHtml("https://resource.example/")).rejects.toThrow(
      "timed out"
    );
    await vi.advanceTimersByTimeAsync(10_001);
    await pending;
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
