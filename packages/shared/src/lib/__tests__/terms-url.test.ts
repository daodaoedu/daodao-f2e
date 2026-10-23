import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getTermsUrl } from "../terms-url";

const LOGIN_DIALOG = path.resolve(__dirname, "../../../../auth/src/components/login-dialog.tsx");

describe("login dialog terms links (daodao#348 regression)", () => {
  it("builds terms links with getTermsUrl instead of a locale-less websiteUrl + /terms/...", () => {
    const source = readFileSync(LOGIN_DIALOG, "utf8");
    expect(source).not.toMatch(/\$\{websiteUrl\}\/terms\//);
    expect(source).toMatch(/getTermsUrl\(/);
  });
});

/**
 * daodao#348：英文版登入畫面的「Terms of Service／Privacy Policy」連到中文條款頁。
 * 官網路由是 next-intl `localePrefix: "as-needed"`：中文不帶前綴、英文要帶 `/en`，
 * 跟官網首頁 footer 的連結一致。
 */
describe("getTermsUrl", () => {
  const website = "https://daodao.so";

  it("links English users to the English terms pages", () => {
    expect(getTermsUrl(website, "en", "service")).toBe("https://daodao.so/en/terms/service");
    expect(getTermsUrl(website, "en", "privacy-policy")).toBe(
      "https://daodao.so/en/terms/privacy-policy"
    );
  });

  it("keeps the default (zh-TW) terms pages without a locale prefix", () => {
    expect(getTermsUrl(website, "zh-TW", "service")).toBe("https://daodao.so/terms/service");
    expect(getTermsUrl(website, "zh-TW", "privacy-policy")).toBe(
      "https://daodao.so/terms/privacy-policy"
    );
  });

  it("does not double the slash when the website URL ends with one", () => {
    expect(getTermsUrl("https://daodao.so/", "en", "service")).toBe(
      "https://daodao.so/en/terms/service"
    );
  });

  it("falls back to a site-relative path when the website URL is empty", () => {
    expect(getTermsUrl("", "en", "service")).toBe("/en/terms/service");
    expect(getTermsUrl("", "zh-TW", "service")).toBe("/terms/service");
  });
});
