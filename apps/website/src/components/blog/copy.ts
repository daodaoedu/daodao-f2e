export const blogCopy = {
  "zh-TW": {
    newsletterDescription: "接收島島的最新消息與學習故事。",
    newsletterLink: "前往主站訂閱",
    title: "讓學習，因連結而更好",
    intro: "給老師與社群帶領者的實作指南、經驗與方法。",
    all: "全部文章",
    empty: "這個主題還沒有文章，先看看其他主題吧。",
    back: "返回所有文章",
    minutes: "分鐘閱讀",
    updated: "更新於",
    toc: "文章目錄",
    share: "分享文章",
    copied: "連結已複製",
    copyError: "無法複製，請從網址列複製連結。",
    related: "延伸閱讀",
    apply: "申請免費封測",
    ctaTitle: "一起設計更好的學習體驗",
    ctaBody: "填寫燈塔封測意願表，讓團隊了解你的需求並聯絡你。需要 Demo 時，由團隊後續安排。",
    preview: "編輯預覽 · 尚未核准發布",
    skip: "跳至主要內容",
    theme: "切換深淺色",
    notFound: "找不到這篇文章",
  },
  en: {
    newsletterDescription: "Receive news and stories from Dao Dao.",
    newsletterLink: "Subscribe on our website",
    title: "Better learning starts with connection",
    intro: "Practical guides, experiences and methods for teachers and community leaders.",
    all: "All articles",
    empty: "No articles in this topic yet. Explore another topic.",
    back: "Back to all articles",
    minutes: "min read",
    updated: "Updated",
    toc: "On this page",
    share: "Share article",
    copied: "Link copied",
    copyError: "Unable to copy. Copy the link from your address bar.",
    related: "Read next",
    apply: "Apply for the free beta",
    ctaTitle: "Create better learning experiences together",
    ctaBody:
      "Complete the Lighthouse beta interest form. Our team will contact you and arrange a demo if needed.",
    preview: "Editorial preview · Not approved for publication",
    skip: "Skip to content",
    theme: "Switch color theme",
    notFound: "Article not found",
  },
} as const;
export type BlogLocaleType = keyof typeof blogCopy;
export function blogLocale(locale: string): BlogLocaleType {
  return locale === "en" ? "en" : "zh-TW";
}
export function blogPath(locale: string, slug?: string) {
  return `${locale === "en" ? "/en" : ""}/blog${slug ? `/${slug}` : ""}`;
}
