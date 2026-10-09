import { describe, expect, it } from "vitest";
import { getChallengeCardAction, getChallengeStatusKey } from "../challenge-card";

const PRACTICE_ID = "7f1c2a4e-0000-4000-8000-000000000001";

const base = {
  isJoined: true,
  canJoin: false,
  unavailableReason: null,
} as const;

describe("getChallengeCardAction", () => {
  // daodao#183 regression：已加入、進行中的「打卡」膠囊點了沒反應——必須帶得到實踐頁的連結
  it("joined + ongoing → enabled check-in linking to the copied practice page", () => {
    expect(getChallengeCardAction({ ...base, runStatus: "ongoing" }, PRACTICE_ID)).toEqual({
      kind: "checkin",
      labelKey: "cta_checkin",
      href: `/practices/${PRACTICE_ID}`,
    });
  });

  it("joined + upcoming → disabled check-in with no link (FR-CC-11 打卡 Disable)", () => {
    expect(getChallengeCardAction({ ...base, runStatus: "upcoming" }, PRACTICE_ID)).toEqual({
      kind: "checkin-disabled",
      labelKey: "cta_checkin",
      href: null,
    });
  });

  it("joined + ended → view summary linking to the practice summary page", () => {
    expect(getChallengeCardAction({ ...base, runStatus: "ended" }, PRACTICE_ID)).toEqual({
      kind: "summary",
      labelKey: "cta_view_summary",
      href: `/practices/${PRACTICE_ID}/summary`,
    });
  });

  it("joined but practice id unknown → keeps the pill but without a link", () => {
    expect(getChallengeCardAction({ ...base, runStatus: "ongoing" }, null)).toEqual({
      kind: "checkin",
      labelKey: "cta_checkin",
      href: null,
    });
    expect(getChallengeCardAction({ ...base, runStatus: "ended" }, undefined)).toEqual({
      kind: "summary",
      labelKey: "cta_view_summary",
      href: null,
    });
  });

  it("encodes the practice id in the href", () => {
    const action = getChallengeCardAction({ ...base, runStatus: "ongoing" }, "a/b?c");
    expect(action.href).toBe("/practices/a%2Fb%3Fc");
  });

  it("not joined + joinable → join", () => {
    expect(
      getChallengeCardAction(
        { isJoined: false, canJoin: true, unavailableReason: null, runStatus: "upcoming" },
        null
      )
    ).toEqual({ kind: "join", labelKey: "cta_join", disabled: false, href: null });
  });

  it("not joined + full → disabled join labelled 已額滿", () => {
    expect(
      getChallengeCardAction(
        { isJoined: false, canJoin: false, unavailableReason: "full", runStatus: "ongoing" },
        null
      )
    ).toEqual({ kind: "join", labelKey: "cta_full", disabled: true, href: null });
  });

  it("not joined + closed → disabled join labelled 報名截止", () => {
    expect(
      getChallengeCardAction(
        { isJoined: false, canJoin: false, unavailableReason: "expired", runStatus: "ongoing" },
        null
      )
    ).toEqual({ kind: "join", labelKey: "cta_closed", disabled: true, href: null });
  });

  it("not joined + ended → no action", () => {
    expect(
      getChallengeCardAction(
        { isJoined: false, canJoin: false, unavailableReason: "ended", runStatus: "ended" },
        PRACTICE_ID
      )
    ).toEqual({ kind: "none", href: null });
  });
});

describe("getChallengeStatusKey", () => {
  it("upcoming / ongoing map to 未開始 / 進行中 regardless of join state", () => {
    expect(getChallengeStatusKey("upcoming", true)).toBe("status_upcoming");
    expect(getChallengeStatusKey("upcoming", false)).toBe("status_upcoming");
    expect(getChallengeStatusKey("ongoing", true)).toBe("status_ongoing");
    expect(getChallengeStatusKey("ongoing", false)).toBe("status_ongoing");
  });

  // daodao#183 regression：已加入的挑戰結束後徽章應為「已完成」，不是「已結束」
  it("joined + ended → 已完成 (status_completed)", () => {
    expect(getChallengeStatusKey("ended", true)).toBe("status_completed");
  });

  it("not joined + ended → keeps 已結束 (status_ended)", () => {
    expect(getChallengeStatusKey("ended", false)).toBe("status_ended");
  });
});
