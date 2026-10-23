import enMessages from "@daodao/i18n/locales/en";
import zhTWMessages from "@daodao/i18n/locales/zh-TW";
import { describe, expect, it } from "vitest";
import { LIGHTHOUSE_APPLY_FORM_URL } from "../lighthouse-access";

/**
 * daodao#354：沒有燈塔權限的人進 /lighthouse 會被導到 access-required，
 * 說明文字改成 PM 指定的文案，「表單」連到燈塔開通申請表單。
 *
 * 說明文字用 t.rich 渲染，`<link>…</link>` 包住的字會換成連到表單的連結；
 * 兩個語系都要有這組標籤，少了就只剩純文字、使用者找不到表單。
 */
type Messages = { lighthouse: Record<string, string> };

const description = (messages: unknown): string =>
  (messages as Messages).lighthouse.membership_required_description ?? "";

const stripLinkTag = (message: string) => message.replace(/<\/?link>/g, "");

describe("燈塔未授權提示文案", () => {
  it("中文說明照 PM 指定文案", () => {
    expect(stripLinkTag(description(zhTWMessages))).toBe(
      "「燈塔」目前僅提供給教學者使用，若你屬於組織已加入，請聯絡組織管理者將你加入。若你希望開通專屬的「燈塔」服務，請填寫此表單，我們將盡快與你連繫。"
    );
  });

  it.each([
    ["zh-TW", zhTWMessages, "表單"],
    ["en", enMessages, "form"],
  ])("%s 說明裡的表單字樣包在 <link> 標籤內", (_locale, messages, linkText) => {
    const message = description(messages);
    expect(message.match(/<link>/g)).toHaveLength(1);
    expect(message.match(/<\/link>/g)).toHaveLength(1);
    expect(message).toContain(`<link>${linkText}</link>`);
  });

  it("英文說明不能殘留中文", () => {
    expect(description(enMessages)).not.toMatch(/[一-鿿]/);
  });

  it("表單連結指向燈塔開通申請表單", () => {
    expect(LIGHTHOUSE_APPLY_FORM_URL).toBe("https://tally.so/r/44WXdk");
  });
});
