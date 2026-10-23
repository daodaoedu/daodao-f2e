import enMessages from "@daodao/i18n/locales/en";
import zhTWMessages from "@daodao/i18n/locales/zh-TW";
import { describe, expect, it } from "vitest";
import { resolveLighthouseAccessRequiredReason } from "../lighthouse-access";

/**
 * daodao#384：權限查詢 API 失敗時 middleware 導到 access-required?reason=unavailable，
 * 頁面要顯示「暫時無法確認權限、請稍後再試」，不能顯示「僅提供給教學者使用」誤導有權限的人。
 */
type Messages = { lighthouse: Record<string, string> };
const lighthouse = (messages: unknown) => (messages as Messages).lighthouse;

describe("燈塔權限頁依 reason 決定顯示哪種說明", () => {
  it("reason=unavailable 顯示暫時無法確認", () => {
    expect(resolveLighthouseAccessRequiredReason("unavailable")).toBe("unavailable");
  });

  it("重複參數取第一個", () => {
    expect(resolveLighthouseAccessRequiredReason(["unavailable", "x"])).toBe("unavailable");
  });

  it.each([
    undefined,
    "",
    "denied",
    "UNAVAILABLE",
    ["denied"],
  ])("其他值（%s）維持未開通說明", (reason) => {
    expect(resolveLighthouseAccessRequiredReason(reason)).toBe("membership");
  });
});

describe("暫時無法確認權限的文案", () => {
  const keys = [
    "membership_unavailable_title",
    "membership_unavailable_description",
    "membership_unavailable_retry",
  ];

  it.each([
    ["zh-TW", zhTWMessages],
    ["en", enMessages],
  ])("%s 有完整文案", (_locale, messages) => {
    for (const key of keys) {
      expect(lighthouse(messages)[key], key).toBeTruthy();
    }
  });

  it("中文說明請使用者稍後再試，不提教學者限定與開通表單", () => {
    const description = lighthouse(zhTWMessages).membership_unavailable_description ?? "";
    expect(lighthouse(zhTWMessages).membership_unavailable_title).toContain("暫時無法確認");
    expect(description).toContain("稍後再試");
    expect(description).not.toContain("教學者");
    expect(description).not.toContain("<link>");
  });

  it("英文文案不能殘留中文", () => {
    for (const key of keys) {
      expect(lighthouse(enMessages)[key] ?? "", key).not.toMatch(/[一-鿿]/);
    }
  });
});
