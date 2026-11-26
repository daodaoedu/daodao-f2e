import { describe, expect, it } from "vitest";
import {
  getChallengeDetailCta,
  getExploreChallengeCardHref,
  parseChallengeId,
} from "../challenge-detail";

const PRACTICE_ID = "7f1c2a4e-0000-4000-8000-000000000001";

const notJoined = { id: 42, isJoined: false, canJoin: true, unavailableReason: null } as const;
const joined = { id: 42, isJoined: true, canJoin: false, unavailableReason: null } as const;

describe("getExploreChallengeCardHref", () => {
  // AC-01：未加入的三種狀態都點得進介紹頁（原本 href 為 null，卡片點不進去）
  it.each([
    "upcoming",
    "ongoing",
    "ended",
  ] as const)("not joined + %s → intro page", (runStatus) => {
    expect(getExploreChallengeCardHref({ ...notJoined, runStatus }, null)).toBe("/challenges/42");
  });

  // FR-CC-20：已加入的人從探索頁點卡片，也先到介紹頁
  it("joined + ongoing with a practice → intro page by default", () => {
    expect(getExploreChallengeCardHref({ ...joined, runStatus: "ongoing" }, PRACTICE_ID)).toBe(
      "/challenges/42"
    );
  });

  it("joined + ongoing with the FR-CC-20 switch off → straight to the practice page", () => {
    expect(
      getExploreChallengeCardHref({ ...joined, runStatus: "ongoing" }, PRACTICE_ID, false)
    ).toBe(`/practices/${PRACTICE_ID}`);
  });

  it("switch off but no practice link (joined + upcoming) → still the intro page, never dead", () => {
    expect(
      getExploreChallengeCardHref({ ...joined, runStatus: "upcoming" }, PRACTICE_ID, false)
    ).toBe("/challenges/42");
  });
});

describe("getChallengeDetailCta", () => {
  it("not joined + upcoming + can join → enabled join", () => {
    expect(getChallengeDetailCta({ ...notJoined, runStatus: "upcoming" }, null)).toMatchObject({
      kind: "join",
      labelKey: "cta_join",
      disabled: false,
    });
  });

  // AC-04：額滿／截止停用並寫原因
  it("not joined + upcoming + full → disabled with the full reason", () => {
    expect(
      getChallengeDetailCta(
        { ...notJoined, canJoin: false, unavailableReason: "full", runStatus: "upcoming" },
        null
      )
    ).toMatchObject({ kind: "join", labelKey: "cta_full", disabled: true });
  });

  it("not joined + upcoming + deadline passed → disabled with the closed reason", () => {
    expect(
      getChallengeDetailCta(
        { ...notJoined, canJoin: false, unavailableReason: "expired", runStatus: "upcoming" },
        null
      )
    ).toMatchObject({ kind: "join", labelKey: "cta_closed", disabled: true });
  });

  // AC-05：未加入的進行中／已結束不給加入，改顯示說明（即使後端說 canJoin）
  it("not joined + ongoing → ongoing notice, no join", () => {
    expect(getChallengeDetailCta({ ...notJoined, runStatus: "ongoing" }, null)).toEqual({
      kind: "notice",
      noticeKey: "detail_notice_ongoing",
    });
  });

  it("not joined + ended → ended notice", () => {
    expect(getChallengeDetailCta({ ...notJoined, runStatus: "ended" }, null)).toEqual({
      kind: "notice",
      noticeKey: "detail_notice_ended",
    });
  });

  // AC-06：已加入依狀態
  it("joined + ongoing → check-in to own practice", () => {
    expect(getChallengeDetailCta({ ...joined, runStatus: "ongoing" }, PRACTICE_ID)).toEqual({
      kind: "checkin",
      labelKey: "cta_checkin",
      href: `/practices/${PRACTICE_ID}`,
    });
  });

  it("joined + ended → summary page", () => {
    expect(getChallengeDetailCta({ ...joined, runStatus: "ended" }, PRACTICE_ID)).toEqual({
      kind: "summary",
      labelKey: "cta_view_summary",
      href: `/practices/${PRACTICE_ID}/summary`,
    });
  });

  it("joined + upcoming → check-in disabled", () => {
    expect(getChallengeDetailCta({ ...joined, runStatus: "upcoming" }, PRACTICE_ID)).toEqual({
      kind: "checkin-disabled",
      labelKey: "cta_checkin",
      href: null,
    });
  });
});

describe("parseChallengeId", () => {
  it("accepts a positive integer", () => {
    expect(parseChallengeId("900002")).toBe(900002);
  });

  // AC-07：亂打的 id 走找不到，不送 API
  it.each([
    undefined,
    "",
    "abc",
    "0",
    "-3",
    "1.5",
    "12abc",
    "99999999999999999999",
  ])("rejects %s", (raw) => {
    expect(parseChallengeId(raw)).toBeNull();
  });
});
