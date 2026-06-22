import { describe, expect, it } from "vitest";
import enMessages from "../../../../../packages/i18n/src/locales/en.json";
import zhTWMessages from "../../../../../packages/i18n/src/locales/zh-TW.json";

describe("logout dialog i18n keys", () => {
  it("en common.cancel must be 'Cancel', not the raw key", () => {
    const cancel = (enMessages as Record<string, Record<string, string>>)["common"]?.["cancel"];
    expect(cancel).toBe("Cancel");
    expect(cancel).not.toContain("common.");
  });

  it("en common.logout_title exists", () => {
    const title = (enMessages as Record<string, Record<string, string>>)["common"]?.["logout_title"];
    expect(title).toBeTruthy();
  });

  it("en common.logout_confirm exists", () => {
    const confirm = (enMessages as Record<string, Record<string, string>>)["common"]?.["logout_confirm"];
    expect(confirm).toBeTruthy();
  });

  it("en common.logout_message exists", () => {
    const message = (enMessages as Record<string, Record<string, string>>)["common"]?.["logout_message"];
    expect(message).toBeTruthy();
  });

  it("zh-TW common.cancel must not be the raw key", () => {
    const cancel = (zhTWMessages as Record<string, Record<string, string>>)["common"]?.["cancel"];
    expect(cancel).toBeTruthy();
    expect(cancel).not.toContain("common.");
  });
});
