import { afterEach, describe, expect, it, vi } from "vitest";
import { getStorage, getStorageKey, StorageEnum } from "../storage";

afterEach(() => vi.unstubAllGlobals());

describe("getStorageKey", () => {
  it("prefixes with underscore and lowercases the enum value", () => {
    expect(getStorageKey(StorageEnum.Quiz)).toBe("_quiz");
    expect(getStorageKey(StorageEnum.UserInfo)).toBe("_userinfo");
    expect(getStorageKey(StorageEnum.Whitelist)).toBe("_whitelist");
    expect(getStorageKey(StorageEnum.OAuthNonce)).toBe("_oauthnonce");
    expect(getStorageKey(StorageEnum.ManualPracticeDraft)).toBe("_manualpracticedraft");
    expect(getStorageKey(StorageEnum.ActionMaker)).toBe("_actionmaker");
    expect(getStorageKey(StorageEnum.AuthSignal)).toBe("_authsignal");
    expect(getStorageKey(StorageEnum.HomeFeedAnchor)).toBe("_homefeedanchor");
    expect(getStorageKey(StorageEnum.RegistrationFlow)).toBe("_registrationflow");
    expect(getStorageKey(StorageEnum.TaskGuideCollapsed)).toBe("_taskguidecollapsed");
    expect(getStorageKey(StorageEnum.PwaInstallDismissedAt)).toBe("_pwainstalldismissedat");
  });
});

describe("StorageEnum", () => {
  it("contains all expected keys", () => {
    expect(Object.keys(StorageEnum).sort()).toEqual(
      [
        "Quiz",
        "UserInfo",
        "Whitelist",
        "OAuthNonce",
        "ManualPracticeDraft",
        "ActionMaker",
        "AuthSignal",
        "HomeFeedAnchor",
        "RegistrationFlow",
        "TaskGuideCollapsed",
        "PwaInstallDismissedAt",
      ].sort()
    );
  });
});

describe("PWA install dismissal storage", () => {
  it("persists the dismissal time in local storage across storage instances", () => {
    const items = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => items.set(key, value),
      removeItem: (key: string) => items.delete(key),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("PWA dismissal must persist beyond this session");
      },
    });

    getStorage<number>(StorageEnum.PwaInstallDismissedAt).set(1_700_000_000_000);

    expect(items.get("_pwainstalldismissedat")).toBe("1700000000000");
    expect(getStorage<number>(StorageEnum.PwaInstallDismissedAt).get()).toBe(1_700_000_000_000);

    getStorage<number>(StorageEnum.PwaInstallDismissedAt).remove();
    expect(items.has("_pwainstalldismissedat")).toBe(false);
    expect(getStorage<number>(StorageEnum.PwaInstallDismissedAt).get()).toBeUndefined();
  });
});
