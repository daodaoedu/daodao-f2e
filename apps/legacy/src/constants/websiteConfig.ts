import getEnv from "@/shared/config/env";

const env = getEnv();

export const websiteConfig = {
  title: "島島阿學",
  defaultFullTitle: "多元學習資源平台｜島島阿學",
  avatarUrl: "/assets/brand/favicon.png",
  authorName: "島島阿學",
  authorEmail: env.contactEmail,
  authorUrl: "https://github.com/daodaoedu",
  domainUrl: env.siteUrl,
  copyright: `2021 - PRESENT © 島島阿學`,
  keywords: ["島島阿學", "自主學習", "學習資源", "教育平台", "共學"],
  themeColor: "#16b9b3",
};
