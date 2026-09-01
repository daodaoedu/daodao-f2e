import { describe, expect, it } from "vitest";
import { deriveNameFromAction } from "../derive-name-from-action";

describe("deriveNameFromAction", () => {
  it("skips a short time clause and picks the longest remaining clause", () => {
    expect(deriveNameFromAction("每天早上七點起來，閱讀《原子習慣》30 頁")).toBe(
      "閱讀《原子習慣》30 頁"
    );
  });

  it("takes the first 20 chars of a 30-char sentence without punctuation", () => {
    const sentence = "一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十";
    expect(sentence).toHaveLength(30);
    expect(deriveNameFromAction(sentence)).toBe("一二三四五六七八九十一二三四五六七八九十");
  });

  it("truncates a single clause longer than 20 chars", () => {
    const clause = "abcdefghijklmnopqrstuvwxyz";
    expect(deriveNameFromAction(clause)).toBe("abcdefghijklmnopqrst");
  });

  it("returns an empty string for blank input", () => {
    expect(deriveNameFromAction("")).toBe("");
    expect(deriveNameFromAction("   \n ")).toBe("");
    expect(deriveNameFromAction("，，。")).toBe("");
  });

  it("defaults to the first clause when it is not time-ish", () => {
    expect(deriveNameFromAction("閱讀原子習慣，每天早上")).toBe("閱讀原子習慣");
  });

  it("keeps the first clause when it is time-ish but the only clause", () => {
    expect(deriveNameFromAction("每天早上七點起來")).toBe("每天早上七點起來");
  });

  it("splits on half-width comma, semicolon, period, and newline", () => {
    expect(deriveNameFromAction("每天7:00, 跑步三公里")).toBe("跑步三公里");
    expect(deriveNameFromAction("睡前;寫日記")).toBe("寫日記");
    expect(deriveNameFromAction("下班後.練吉他半小時")).toBe("練吉他半小時");
    expect(deriveNameFromAction("週末\n整理房間")).toBe("整理房間");
  });

  it("falls back to the longest non-first clause when all remaining are time-ish too", () => {
    expect(deriveNameFromAction("每天，早上七點，晚上十點半")).toBe("晚上十點半");
  });
});
