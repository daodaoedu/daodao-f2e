import { describe, expect, it } from "vitest";
import { getStorageKey, StorageEnum } from "../storage";

const expectedStorageKeys: Record<keyof typeof StorageEnum, string> = {
  Quiz: "_quiz",
  UserInfo: "_userinfo",
  Whitelist: "_whitelist",
  OAuthNonce: "_oauthnonce",
  ManualPracticeDraft: "_manualpracticedraft",
  PracticeWizardDraft: "_practicewizarddraft",
  ActionMaker: "_actionmaker",
  AuthSignal: "_authsignal",
  HomeFeedAnchor: "_homefeedanchor",
  RegistrationFlow: "_registrationflow",
  TaskGuideCollapsed: "_taskguidecollapsed",
  PwaInstallDismissedAt: "_pwainstalldismissedat",
  LighthouseSidebarCollapsed: "_lighthousesidebarcollapsed",
  ChatPinBannerDismissed: "_chatpinbannerdismissed",
};

describe("getStorageKey", () => {
  it.each(
    Object.entries(expectedStorageKeys)
  )("maps %s to its stable browser-storage key", (enumKey, expectedKey) => {
    expect(getStorageKey(StorageEnum[enumKey as keyof typeof StorageEnum])).toBe(expectedKey);
  });
});

describe("StorageEnum", () => {
  it("contains all expected keys", () => {
    expect(Object.keys(StorageEnum)).toEqual(Object.keys(expectedStorageKeys));
  });
});
