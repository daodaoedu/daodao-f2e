import { describe, expect, it } from "vitest";
import { getStorageKey, StorageEnum } from "../storage";

describe("getStorageKey", () => {
  it("prefixes with underscore and lowercases the enum value", () => {
    expect(getStorageKey(StorageEnum.Quiz)).toBe("_quiz");
    expect(getStorageKey(StorageEnum.UserInfo)).toBe("_userinfo");
    expect(getStorageKey(StorageEnum.Whitelist)).toBe("_whitelist");
    expect(getStorageKey(StorageEnum.OAuthNonce)).toBe("_oauthnonce");
    expect(getStorageKey(StorageEnum.ManualPracticeDraft)).toBe("_manualpracticedraft");
    expect(getStorageKey(StorageEnum.ActionMaker)).toBe("_actionmaker");
    expect(getStorageKey(StorageEnum.AuthSignal)).toBe("_authsignal");
  });
});

describe("StorageEnum", () => {
  it("contains all expected keys", () => {
    const keys = Object.keys(StorageEnum);
    expect(keys).toContain("Quiz");
    expect(keys).toContain("UserInfo");
    expect(keys).toContain("Whitelist");
    expect(keys).toContain("OAuthNonce");
    expect(keys).toContain("ManualPracticeDraft");
    expect(keys).toContain("ActionMaker");
    expect(keys).toContain("AuthSignal");
    expect(keys).toHaveLength(7);
  });
});
