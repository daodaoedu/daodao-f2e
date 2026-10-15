import { describe, expect, it } from "vitest";
import { resolveJoinConsentCopy } from "../cohort-join-consent";

// #279：加入頁同意文字要對應實際可見範圍。
// 實際範圍只由 isPrivate 決定；checkinDefaultPrivate 目前只存值、尚未生效（PM 2026-09-03 B1）。
describe("resolveJoinConsentCopy", () => {
  it("private cohort: check-ins stay inside the cohort", () => {
    expect(resolveJoinConsentCopy({ isPrivate: true, checkinDefaultPrivate: false })).toEqual({
      consentKey: "visibility_consent_private",
      pendingNoticeKey: null,
    });
  });

  it("public cohort: check-ins are visible to everyone", () => {
    expect(resolveJoinConsentCopy({ isPrivate: false, checkinDefaultPrivate: false })).toEqual({
      consentKey: "visibility_consent_public",
      pendingNoticeKey: null,
    });
  });

  it("default-private check-ins: does not promise privacy, explains the setting is not live yet", () => {
    expect(resolveJoinConsentCopy({ isPrivate: true, checkinDefaultPrivate: true })).toEqual({
      consentKey: "visibility_consent_private",
      pendingNoticeKey: "checkin_default_private_pending",
    });
  });

  it("public cohort ignores a stale default-private flag", () => {
    // server 會在 isPrivate=false 時把 checkinDefaultPrivate 正規化為 false；防守舊資料
    expect(resolveJoinConsentCopy({ isPrivate: false, checkinDefaultPrivate: true })).toEqual({
      consentKey: "visibility_consent_public",
      pendingNoticeKey: null,
    });
  });
});
