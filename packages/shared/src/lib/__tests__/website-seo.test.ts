import { describe, expect, it } from "vitest";
import { buildWebsiteRobots, buildWebsiteSitemap } from "../website-seo";

describe("buildWebsiteRobots", () => {
  it("正式站允許收錄並指向 sitemap", () => {
    const robots = buildWebsiteRobots("https://daodao.so");
    expect(robots.rules).toEqual([expect.objectContaining({ userAgent: "*", allow: "/" })]);
    expect(robots.sitemap).toBe("https://daodao.so/sitemap.xml");
  });

  it("正式站網址結尾有斜線也視為正式站", () => {
    const robots = buildWebsiteRobots("https://daodao.so/");
    expect(robots.sitemap).toBe("https://daodao.so/sitemap.xml");
  });

  it("正式站擋掉內部設計系統頁", () => {
    const [rule] = buildWebsiteRobots("https://daodao.so").rules as { disallow?: string[] }[];
    expect(rule?.disallow).toEqual(expect.arrayContaining(["/dev/", "/en/dev/"]));
  });

  it.each([
    "https://dev.daodao.so",
    "http://localhost:3000",
    "",
    undefined,
  ])("非正式站（%s）全站禁止收錄且不提供 sitemap", (url) => {
    const robots = buildWebsiteRobots(url);
    expect(robots.rules).toEqual([{ userAgent: "*", disallow: "/" }]);
    expect(robots.sitemap).toBeUndefined();
  });
});

describe("buildWebsiteSitemap", () => {
  const sitemap = buildWebsiteSitemap("https://daodao.so");
  const urls = sitemap.map((entry) => entry.url);

  it("中文頁不帶語系前綴、英文頁帶 /en，與官網路由一致", () => {
    expect(urls).toContain("https://daodao.so");
    expect(urls).toContain("https://daodao.so/about");
    expect(urls).toContain("https://daodao.so/en");
    expect(urls).toContain("https://daodao.so/en/about");
    expect(urls).toContain("https://daodao.so/terms/privacy-policy");
  });

  it("每頁標出中英文對應版本", () => {
    const about = sitemap.find((entry) => entry.url === "https://daodao.so/about");
    expect(about?.alternates?.languages).toEqual({
      "zh-TW": "https://daodao.so/about",
      en: "https://daodao.so/en/about",
      "x-default": "https://daodao.so/about",
    });
  });

  it("不列入 noindex 的行動製造機與內部設計系統頁", () => {
    expect(urls.some((url) => url.includes("/action-maker"))).toBe(false);
    expect(urls.some((url) => url.includes("/dev/"))).toBe(false);
  });

  it("非正式站回傳空 sitemap", () => {
    expect(buildWebsiteSitemap("https://dev.daodao.so")).toEqual([]);
  });
});
