import { describe, expect, it } from "vitest";
import enMessages from "../../../../../packages/i18n/src/locales/en.json";
import zhTWMessages from "../../../../../packages/i18n/src/locales/zh-TW.json";

describe("logout dialog i18n keys", () => {
  it("en common.cancel must be 'Cancel', not the raw key", () => {
    const cancel = enMessages.common.cancel;
    expect(cancel).toBe("Cancel");
    expect(cancel).not.toContain("common.");
  });

  it("en common.logout_title exists", () => {
    expect(enMessages.common.logout_title).toBeTruthy();
  });

  it("en common.logout_confirm exists", () => {
    expect(enMessages.common.logout_confirm).toBeTruthy();
  });

  it("en common.logout_message exists", () => {
    expect(enMessages.common.logout_message).toBeTruthy();
  });

  it("zh-TW common.cancel must not be the raw key", () => {
    const cancel = zhTWMessages.common.cancel;
    expect(cancel).toBeTruthy();
    expect(cancel).not.toContain("common.");
  });
});
