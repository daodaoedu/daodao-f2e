import enMessages from "@daodao/i18n/locales/en";
import zhTWMessages from "@daodao/i18n/locales/zh-TW";
import { describe, expect, it } from "vitest";

/**
 * daodao#163 regression guard（PM 驗收步驟 c）。
 *
 * zh-TW.json 有 `future_letter.sent_badge`／`read_badge`，en.json 漏了，英文版足跡卡片直接顯示
 * 原始 key。next-intl 缺 key 時只在 console 報錯、畫面 fallback 成 key，typecheck／lint 都抓不到。
 *
 * 兩個 locale 的 key 集合必須一致：在任一邊加 key，另一邊也要加。
 */
type Messages = { [key: string]: string | Messages } | string[];

const flattenKeys = (messages: Messages, prefix = ""): string[] =>
  Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flattenKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );

describe("locale key parity", () => {
  const zhKeys = new Set(flattenKeys(zhTWMessages));
  const enKeys = new Set(flattenKeys(enMessages));

  it("every zh-TW key exists in en", () => {
    expect([...zhKeys].filter((key) => !enKeys.has(key))).toEqual([]);
  });

  it("every en key exists in zh-TW", () => {
    expect([...enKeys].filter((key) => !zhKeys.has(key))).toEqual([]);
  });
});
