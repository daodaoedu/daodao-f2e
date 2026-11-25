import createClient from "openapi-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 用真的 openapi-fetch 解析回應，只換掉 fetch：非 JSON body、空 body 的行為來自函式庫本身
const respond = vi.hoisted(() => ({ next: (): Promise<Response> => Promise.reject(new Error()) }));
vi.mock("../client", () => ({
  PREFIX: "test",
  client: createClient({ baseUrl: "http://api.test", fetch: () => respond.next() }),
}));

import { probeLighthouseAccess } from "../services/lighthouse-access-hooks";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const path = "/api/v1/lighthouse/organizations" as const;

describe("probeLighthouseAccess", () => {
  beforeEach(() => {
    respond.next = () => Promise.reject(new Error("unset"));
  });

  it("reports the list length for a member", async () => {
    respond.next = async () => json(200, { success: true, data: [{ id: 2 }, { id: 7 }] });
    await expect(probeLighthouseAccess(path)).resolves.toEqual({ status: 200, count: 2 });
  });

  it("keeps 403 distinct from outages even though both say APP_ERROR", async () => {
    const appError = { success: false, data: null, error: { code: "APP_ERROR" } };
    respond.next = async () => json(403, appError);
    await expect(probeLighthouseAccess(path)).resolves.toEqual({ status: 403, count: null });
    respond.next = async () => json(500, appError);
    await expect(probeLighthouseAccess(path)).resolves.toEqual({ status: 500, count: null });
  });

  it("keeps the status for empty and non-JSON error bodies", async () => {
    respond.next = async () => new Response(null, { status: 429 });
    await expect(probeLighthouseAccess(path)).resolves.toEqual({ status: 429, count: null });
    respond.next = async () =>
      new Response("<html>Bad Gateway</html>", {
        status: 502,
        headers: { "content-type": "text/html" },
      });
    await expect(probeLighthouseAccess(path)).resolves.toEqual({ status: 502, count: null });
  });

  it("reports no count when a 200 carries no list", async () => {
    respond.next = async () => json(200, { success: true, data: { id: 2 } });
    await expect(probeLighthouseAccess(path)).resolves.toEqual({ status: 200, count: null });
  });

  it("rejects on network failure so SWR reports an error", async () => {
    respond.next = () => Promise.reject(new TypeError("Failed to fetch"));
    await expect(probeLighthouseAccess(path)).rejects.toThrow(TypeError);
  });
});
