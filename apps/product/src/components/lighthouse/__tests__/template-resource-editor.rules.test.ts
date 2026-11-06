import { describe, expect, it } from "vitest";
import { validateEditorResource } from "../template-resource-editor.rules";

describe("cohort resource editor rules (FRD TP-004)", () => {
  it.each([
    ["http://EXAMPLE.com:80/a", "http://example.com/a"],
    ["https://EXAMPLE.com:443/a", "https://example.com/a"],
    ["example.com/a", "https://example.com/a"],
    ["localhost:3000/a", "https://localhost:3000/a"],
    ["example.com:3000/a", "https://example.com:3000/a"],
    ["not-a-url", "https://not-a-url/"],
  ])("accepts %s and normalizes it", (url, normalized) => {
    expect(validateEditorResource({ name: "  閱讀  ", url }, [], "cohort")).toEqual({
      value: { name: "閱讀", url: normalized },
    });
  });

  it.each([
    "ftp://example.com",
    "javascript:alert(1)",
    "mailto:a@example.com",
    "https://",
    "http:example.com",
    "https:/example.com",
    "https://example.com/a b",
    "https://example.com/\\a",
    "http://a b.com",
  ])("rejects invalid or unsupported URL %s", (url) => {
    expect(validateEditorResource({ name: "閱讀", url }, [], "cohort")).toEqual({
      error: "invalid",
    });
  });

  it("limits the normalized URL to the database's 1000 characters", () => {
    const prefix = "https://example.com/";
    const atLimit = prefix + "a".repeat(1000 - prefix.length);
    expect(validateEditorResource({ name: "講義", url: atLimit }, [], "cohort")).toEqual({
      value: { name: "講義", url: atLimit },
    });
    expect(validateEditorResource({ name: "講義", url: atLimit + "a" }, [], "cohort")).toEqual({
      error: "invalid",
    });
    expect(
      validateEditorResource({ name: "講義", url: "example.com/" + "中".repeat(120) }, [], "cohort")
    ).toEqual({ error: "invalid" });
  });

  it("rejects names longer than 100 characters", () => {
    expect(validateEditorResource({ name: "名".repeat(101), url: "" }, [], "cohort")).toEqual({
      error: "nameMax",
    });
    expect(validateEditorResource({ name: "名".repeat(100), url: "" }, [], "cohort")).toEqual({
      value: { name: "名".repeat(100), url: "" },
    });
  });

  it("rejects empty names and adding resource 51", () => {
    expect(validateEditorResource({ name: "  ", url: "" }, [], "cohort")).toEqual({
      error: "name",
    });
    const fifty = Array.from({ length: 50 }, (_, i) => ({
      key: String(i),
      name: String(i),
      url: "",
    }));
    expect(validateEditorResource({ name: "第51筆", url: "" }, fifty, "cohort")).toEqual({
      error: "full",
    });
    expect(validateEditorResource({ name: "第五十筆", url: "" }, fifty.slice(1), "cohort")).toEqual(
      { value: { name: "第五十筆", url: "" } }
    );
  });

  it("rejects normalized duplicate links, even when names differ", () => {
    expect(
      validateEditorResource(
        { name: "另一名稱", url: "https://EXAMPLE.com:443/a/#section" },
        [{ key: "1", name: "原名稱", url: "https://example.com/a" }],
        "cohort"
      )
    ).toEqual({ error: "duplicateUrl" });
  });

  it("allows same names with distinct links, but rejects duplicate unlinked names", () => {
    const resources = [{ key: "1", name: "閱讀", url: "https://example.com/a" }];
    expect(
      validateEditorResource({ name: "閱讀", url: "https://example.com/b" }, resources, "cohort")
    ).toEqual({ value: { name: "閱讀", url: "https://example.com/b" } });
    expect(validateEditorResource({ name: "閱讀", url: "" }, resources, "cohort")).toEqual({
      value: { name: "閱讀", url: "" },
    });
    expect(
      validateEditorResource(
        { name: " ABC ", url: "" },
        [{ key: "1", name: "abc", url: "" }],
        "cohort"
      )
    ).toEqual({ error: "duplicateName" });
  });

  it("allows editing an existing entry at the limit without treating itself as duplicate", () => {
    const resources = Array.from({ length: 50 }, (_, i) => ({
      key: String(i),
      name: String(i),
      url: `https://example.com/${i}`,
    }));
    expect(
      validateEditorResource(
        { name: "更新名稱", url: "https://example.com/0" },
        resources,
        "cohort",
        "0"
      )
    ).toEqual({ value: { name: "更新名稱", url: "https://example.com/0" } });
  });
});

describe("existing template resource rules", () => {
  it("keeps the five resource limit and HTTPS requirement", () => {
    const five = Array.from({ length: 5 }, (_, i) => ({
      key: String(i),
      name: String(i),
      url: "",
    }));
    expect(validateEditorResource({ name: "第六筆", url: "" }, five, "template")).toEqual({
      error: "full",
    });
    expect(
      validateEditorResource({ name: "閱讀", url: "http://example.com" }, [], "template")
    ).toEqual({ error: "https" });
    expect(validateEditorResource({ name: "閱讀", url: "example.com" }, [], "template")).toEqual({
      error: "invalid",
    });
  });

  it("keeps template names unique even with distinct links", () => {
    expect(
      validateEditorResource(
        { name: "閱讀", url: "https://example.com/b" },
        [{ key: "1", name: "閱讀", url: "https://example.com/a" }],
        "template"
      )
    ).toEqual({ error: "duplicateName" });
  });
});
