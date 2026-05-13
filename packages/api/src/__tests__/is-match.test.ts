import { describe, expect, it } from "vitest";
import { isMatch } from "../is-match";

describe("isMatch", () => {
  describe("primitives and strict equality", () => {
    it("returns true for identical numbers", () => {
      expect(isMatch(1, 1)).toBe(true);
    });

    it("returns true for identical strings", () => {
      expect(isMatch("hello", "hello")).toBe(true);
    });

    it("returns true for both null", () => {
      expect(isMatch(null, null)).toBe(true);
    });

    it("returns true for both undefined", () => {
      expect(isMatch(undefined, undefined)).toBe(true);
    });

    it("returns false for different primitives", () => {
      expect(isMatch(1, 2)).toBe(false);
      expect(isMatch("a", "b")).toBe(false);
    });

    it("returns false for null vs object", () => {
      expect(isMatch(null, { a: 1 })).toBe(false);
      expect(isMatch({ a: 1 }, null)).toBe(false);
    });

    it("returns false for primitive vs object", () => {
      expect(isMatch(42, { a: 1 })).toBe(false);
      expect(isMatch({ a: 1 }, 42)).toBe(false);
    });
  });

  describe("objects", () => {
    it("matches when object contains all source keys", () => {
      expect(isMatch({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 })).toBe(true);
    });

    it("fails when a source key is missing from object", () => {
      expect(isMatch({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it("fails when values differ", () => {
      expect(isMatch({ a: 1 }, { a: 2 })).toBe(false);
    });

    it("empty source object matches any object", () => {
      expect(isMatch({ a: 1 }, {})).toBe(true);
    });

    it("empty source object matches an empty object", () => {
      expect(isMatch({}, {})).toBe(true);
    });

    it("empty source object matches an array (arrays are objects)", () => {
      expect(isMatch([1, 2], {})).toBe(true);
    });
  });

  describe("arrays", () => {
    it("empty source array matches any array", () => {
      expect(isMatch([1, 2, 3], [])).toBe(true);
      expect(isMatch([], [])).toBe(true);
    });

    it("empty source array does not match a non-array object", () => {
      expect(isMatch({ length: 0 }, [])).toBe(false);
    });

    it("matches when source elements match corresponding object elements", () => {
      expect(isMatch([1, 2, 3], [1, 2])).toBe(true);
    });

    it("fails when object array is shorter than source", () => {
      expect(isMatch([1], [1, 2])).toBe(false);
    });

    it("fails when elements differ", () => {
      expect(isMatch([1, 2], [1, 3])).toBe(false);
    });

    it("source array does not match a non-array", () => {
      expect(isMatch({ 0: 1 }, [1])).toBe(false);
    });
  });

  describe("nested structures", () => {
    it("matches nested objects", () => {
      const object = { a: { b: { c: 1 } }, d: 2 };
      expect(isMatch(object, { a: { b: { c: 1 } } })).toBe(true);
    });

    it("fails on nested value mismatch", () => {
      expect(isMatch({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it("matches arrays inside objects", () => {
      const object = { tags: ["a", "b", "c"] };
      expect(isMatch(object, { tags: ["a", "b"] })).toBe(true);
    });

    it("matches objects inside arrays", () => {
      const object = [{ id: 1 }, { id: 2 }];
      expect(isMatch(object, [{ id: 1 }])).toBe(true);
    });

    it("deeply nested mixed structures", () => {
      const object = { users: [{ name: "Alice", roles: ["admin"] }] };
      expect(isMatch(object, { users: [{ roles: ["admin"] }] })).toBe(true);
      expect(isMatch(object, { users: [{ roles: ["user"] }] })).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("same reference returns true", () => {
      const obj = { a: 1 };
      expect(isMatch(obj, obj)).toBe(true);
    });

    it("boolean values", () => {
      expect(isMatch(true, true)).toBe(true);
      expect(isMatch(true, false)).toBe(false);
    });

    it("0 and empty string are not equal", () => {
      expect(isMatch(0, "")).toBe(false);
    });
  });
});
