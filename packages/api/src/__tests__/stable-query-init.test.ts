import { describe, expect, it } from "vitest";
import { deserializeQueryInit, serializeQueryInit } from "../stable-query-init";

describe("serializeQueryInit / deserializeQueryInit", () => {
  it("round-trips null (disabled query)", () => {
    expect(serializeQueryInit(null)).toBe("__null__");
    expect(deserializeQueryInit(serializeQueryInit(null))).toBeNull();
  });

  it("round-trips undefined (omitted init)", () => {
    expect(serializeQueryInit(undefined)).toBe("__undefined__");
    expect(deserializeQueryInit(serializeQueryInit(undefined))).toBeUndefined();
  });

  it("stable key for equivalent empty objects", () => {
    expect(serializeQueryInit({})).toBe(serializeQueryInit({}));
    expect(deserializeQueryInit(serializeQueryInit({}))).toEqual({});
  });

  it("stable key for equivalent nested params (practice list shape)", () => {
    const a = {
      params: {
        query: {
          page: 1,
          limit: 16,
          status: undefined as string | undefined,
        },
      },
    };
    const b = {
      params: {
        query: {
          page: 1,
          limit: 16,
        },
      },
    };
    // JSON drops undefined keys → same serialization
    expect(serializeQueryInit(a)).toBe(serializeQueryInit(b));
  });

  it("different content yields different keys", () => {
    const a = { params: { path: { id: "1" } } };
    const b = { params: { path: { id: "2" } } };
    expect(serializeQueryInit(a)).not.toBe(serializeQueryInit(b));
  });

  it("round-trips reaction query init", () => {
    const init = {
      params: {
        query: {
          targetType: "practice",
          targetId: "uuid-1",
        },
      },
    };
    const key = serializeQueryInit(init);
    expect(deserializeQueryInit(key)).toEqual(init);
  });
});
